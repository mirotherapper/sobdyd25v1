import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../../lib/mongodb';
import { PlaylistData } from '../../../../../lib/types';
import { ObjectId } from 'mongodb';

export async function POST(request: Request) {
  try {
    const { db } = await connectToDatabase();

    // Find the active playlist
    const livePlaylist = await db.collection<PlaylistData>('playlists').findOne(
      { is_show_archive: { $ne: true } }
    );

    if (!livePlaylist) {
      return NextResponse.json({ message: 'Live playlist not found' }, { status: 404 });
    }

    // Toggle the lock state
    const newLockState = !livePlaylist.is_locked;

    await db.collection('playlists').updateOne(
      { _id: new ObjectId(livePlaylist._id) },
      { $set: { is_locked: newLockState } }
    );

    return NextResponse.json({
      message: `Queue is now ${newLockState ? 'locked' : 'unlocked'}.`,
      is_locked: newLockState
    }, { status: 200 });

  } catch (error) {
    console.error('Error toggling playlist lock:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown server error occurred';
    return NextResponse.json({ message: 'Error toggling lock state', error: errorMessage }, { status: 500 });
  }
}