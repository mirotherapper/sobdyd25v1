/**
 * API Route for Ratings
 * Handles user ratings for tracks
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import clientPromise from '../../../../lib/mongodb';

// MongoDB connection will be established when needed

// Submit a rating
export async function POST(request: NextRequest) {
  try {
    // Auth check - only signed in users can rate
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { playlistItemId, rating } = body;

    // Validate required fields
    if (!playlistItemId) {
      return NextResponse.json(
        { error: 'Playlist item ID is required' },
        { status: 400 }
      );
    }

    // Validate rating
    if (typeof rating !== 'number' || rating < 0 || rating > 100) {
      return NextResponse.json(
        { error: 'Rating must be a number between 0 and 100' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('traxplaya');

    // Check if playlist item exists
    const playlistItem = await db
      .collection('playlistItems')
      .findOne({ _id: playlistItemId });

    if (!playlistItem) {
      return NextResponse.json(
        { error: 'Playlist item not found' },
        { status: 404 }
      );
    }

    // Check if user already rated this item
    const existingRating = await db.collection('ratings').findOne({
      playlistItemId,
      userId,
    });

    if (existingRating) {
      // Update existing rating
      await db.collection('ratings').updateOne(
        { _id: existingRating._id },
        {
          $set: {
            rating,
            updatedAt: new Date(),
          },
        }
      );
    } else {
      // Create new rating
      await db.collection('ratings').insertOne({
        playlistItemId,
        userId,
        rating,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Update average rating on playlist item
    const allRatings = await db
      .collection('ratings')
      .find({ playlistItemId })
      .toArray();

    const totalRating = allRatings.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalRating / allRatings.length;

    await db.collection('playlistItems').updateOne(
      { _id: playlistItemId },
      {
        $set: {
          avgRating,
          ratingCount: allRatings.length,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      rating,
      avgRating,
      ratingCount: allRatings.length,
    });
  } catch (error) {
    console.error('Error submitting rating:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get ratings for a user or item
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const playlistItemId = searchParams.get('playlistItemId');
    const userIdParam = searchParams.get('userId');

    // Auth check - only signed in users can view ratings
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db('traxplaya');

    // If no specific params, return user's ratings
    if (!playlistItemId && !userIdParam) {
      const userRatings = await db
        .collection('ratings')
        .find({ userId })
        .sort({ createdAt: -1 })
        .toArray();

      return NextResponse.json({ ratings: userRatings });
    }

    // If playlist item specified, get its ratings
    if (playlistItemId) {
      // Check if admin for all ratings
      const user = await db.collection('users').findOne({ userId });
      const isAdmin = user?.roles?.includes('admin');

      if (isAdmin) {
        // Admins can see all ratings
        const itemRatings = await db
          .collection('ratings')
          .find({ playlistItemId })
          .sort({ createdAt: -1 })
          .toArray();

        const avgRating =
          itemRatings.length > 0
            ? itemRatings.reduce((sum, r) => sum + r.rating, 0) /
              itemRatings.length
            : 0;

        return NextResponse.json({
          ratings: itemRatings,
          avgRating,
          count: itemRatings.length,
        });
      } else {
        // Regular users can only see their own rating
        const userRating = await db.collection('ratings').findOne({
          playlistItemId,
          userId,
        });

        // Get average rating
        const allRatings = await db
          .collection('ratings')
          .find({ playlistItemId })
          .toArray();

        const avgRating =
          allRatings.length > 0
            ? allRatings.reduce((sum, r) => sum + r.rating, 0) /
              allRatings.length
            : 0;

        return NextResponse.json({
          userRating: userRating?.rating || 0,
          avgRating,
          count: allRatings.length,
        });
      }
    }

    // If userId specified and is admin, get that user's ratings
    if (userIdParam) {
      const user = await db.collection('users').findOne({ userId });
      const isAdmin = user?.roles?.includes('admin');

      if (isAdmin || userIdParam === userId) {
        const targetUserRatings = await db
          .collection('ratings')
          .find({ userId: userIdParam })
          .sort({ createdAt: -1 })
          .toArray();

        return NextResponse.json({ ratings: targetUserRatings });
      } else {
        return NextResponse.json(
          { error: "Unauthorized to view other users' ratings" },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error('Error fetching ratings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
