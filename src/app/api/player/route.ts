/**
 * API Route for Player Control
 * Handles player state, control actions, and real-time updates
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import clientPromise from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';
import { socketService } from '@/lib/services/socketService';

// MongoDB connection will be established when needed

// Get current player state
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const showId = searchParams.get('showId') || 'current';

    const client = await clientPromise;
    const db = client.db('traxplaya');

    // Get current show
    const show =
      showId === 'current'
        ? await db.collection('shows').findOne({ isLive: true })
        : await db.collection('shows').findOne({ _id: new ObjectId(showId) });

    if (!show) {
      return NextResponse.json({ error: 'Show not found' }, { status: 404 });
    }

    // Get now playing item
    const nowPlaying = await db.collection('playlistItems').findOne({
      showId: show._id,
      status: 'now_playing',
    });

    // Get queued items
    const queue = await db
      .collection('playlistItems')
      .find({
        showId: show._id,
        status: 'queued',
      })
      .sort({ position: 1 })
      .toArray();

    return NextResponse.json({
      showId: show._id,
      status: nowPlaying ? 'playing' : 'idle',
      nowPlaying,
      queue,
      queueLocked: show.queueLocked || false,
    });
  } catch (error) {
    console.error('Error fetching player state:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Control player
export async function POST(request: NextRequest) {
  try {
    // Auth check - only authorized users can control player
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user role
    const client = await clientPromise;
    const db = client.db('traxplaya');
    const user = await db.collection('users').findOne({ userId });

    // Only admins can control player
    if (!user || !user.roles || !user.roles.includes('admin')) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, showId = 'current', itemId, position } = body;

    // Get target show
    const show =
      showId === 'current'
        ? await db.collection('shows').findOne({ isLive: true })
        : await db.collection('shows').findOne({ _id: new ObjectId(showId) });

    if (!show) {
      return NextResponse.json({ error: 'Show not found' }, { status: 404 });
    }

    // Handle different control actions
    switch (action) {
      case 'play':
        // If nothing is playing, start first item in queue
        if (
          !(await db
            .collection('playlistItems')
            .findOne({ showId: show._id, status: 'now_playing' }))
        ) {
          const firstInQueue = await db
            .collection('playlistItems')
            .findOne(
              { showId: show._id, status: 'queued' },
              { sort: { position: 1 } }
            );

          if (firstInQueue) {
            await db.collection('playlistItems').updateOne(
              { _id: firstInQueue._id },
              {
                $set: {
                  status: 'now_playing',
                  startedAt: new Date(),
                },
              }
            );

            // Emit real-time event
            socketService.emit('player:trackChange', {
              nowPlaying: {
                ...firstInQueue,
                status: 'now_playing',
                startedAt: new Date(),
              },
            });
          }
        }

        // Emit play status
        socketService.emit('player:status', { status: 'playing' });
        break;

      case 'pause':
        // Just emit pause status - we keep the now_playing item
        socketService.emit('player:status', { status: 'paused' });
        break;

      case 'next':
        // Move current track to played status
        const currentTrack = await db
          .collection('playlistItems')
          .findOne({ showId: show._id, status: 'now_playing' });

        if (currentTrack) {
          await db.collection('playlistItems').updateOne(
            { _id: currentTrack._id },
            {
              $set: {
                status: 'played',
                endedAt: new Date(),
              },
            }
          );
        }

        // Move next in queue to now playing
        const nextInQueue = await db
          .collection('playlistItems')
          .findOne(
            { showId: show._id, status: 'queued' },
            { sort: { position: 1 } }
          );

        if (nextInQueue) {
          await db.collection('playlistItems').updateOne(
            { _id: nextInQueue._id },
            {
              $set: {
                status: 'now_playing',
                startedAt: new Date(),
              },
            }
          );

          // Emit track change event
          socketService.emit('player:trackChange', {
            nowPlaying: {
              ...nextInQueue,
              status: 'now_playing',
              startedAt: new Date(),
            },
          });

          // Emit play status
          socketService.emit('player:status', { status: 'playing' });
        } else {
          // No more tracks in queue
          socketService.emit('player:trackChange', { nowPlaying: null });
          socketService.emit('player:status', { status: 'stopped' });
        }

        // Reindex queue positions
        const remainingQueue = await db
          .collection('playlistItems')
          .find({ showId: show._id, status: 'queued' })
          .sort({ position: 1 })
          .toArray();

        for (let i = 0; i < remainingQueue.length; i++) {
          await db
            .collection('playlistItems')
            .updateOne(
              { _id: remainingQueue[i]._id },
              { $set: { position: i } }
            );
        }

        // Emit updated queue
        socketService.emit('queue:update', {
          queue: remainingQueue.map((item, idx) => ({
            ...item,
            position: idx,
          })),
        });
        break;

      case 'lock-queue':
        // Lock queue
        await db
          .collection('shows')
          .updateOne({ _id: show._id }, { $set: { queueLocked: true } });
        socketService.emit('queue:locked', { isLocked: true });
        break;

      case 'unlock-queue':
        // Unlock queue
        await db
          .collection('shows')
          .updateOne({ _id: show._id }, { $set: { queueLocked: false } });
        socketService.emit('queue:locked', { isLocked: false });
        break;

      case 'move-item':
        // Check if queue is locked
        if (show.queueLocked) {
          return NextResponse.json(
            { error: 'Queue is locked' },
            { status: 400 }
          );
        }

        // Validate params
        if (!itemId || position === undefined) {
          return NextResponse.json(
            { error: 'Item ID and position are required' },
            { status: 400 }
          );
        }

        // Update item position
        await db
          .collection('playlistItems')
          .updateOne(
            { _id: itemId, showId: show._id, status: 'queued' },
            { $set: { position } }
          );

        // Reindex all queue positions
        const updatedQueue = await db
          .collection('playlistItems')
          .find({ showId: show._id, status: 'queued' })
          .sort({ position: 1 })
          .toArray();

        for (let i = 0; i < updatedQueue.length; i++) {
          if (updatedQueue[i].position !== i) {
            await db
              .collection('playlistItems')
              .updateOne(
                { _id: updatedQueue[i]._id },
                { $set: { position: i } }
              );
          }
        }

        // Get final queue state after reindexing
        const finalQueue = await db
          .collection('playlistItems')
          .find({ showId: show._id, status: 'queued' })
          .sort({ position: 1 })
          .toArray();

        // Emit updated queue
        socketService.emit('queue:update', { queue: finalQueue });
        break;

      case 'remove-item':
        // Check if queue is locked
        if (show.queueLocked) {
          return NextResponse.json(
            { error: 'Queue is locked' },
            { status: 400 }
          );
        }

        // Validate params
        if (!itemId) {
          return NextResponse.json(
            { error: 'Item ID is required' },
            { status: 400 }
          );
        }

        // Remove item
        await db
          .collection('playlistItems')
          .deleteOne({ _id: itemId, showId: show._id, status: 'queued' });

        // Reindex queue positions
        const remainingItems = await db
          .collection('playlistItems')
          .find({ showId: show._id, status: 'queued' })
          .sort({ position: 1 })
          .toArray();

        for (let i = 0; i < remainingItems.length; i++) {
          await db
            .collection('playlistItems')
            .updateOne(
              { _id: remainingItems[i]._id },
              { $set: { position: i } }
            );
        }

        // Emit updated queue
        socketService.emit('queue:update', {
          queue: remainingItems.map((item, idx) => ({
            ...item,
            position: idx,
          })),
        });
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error controlling player:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
