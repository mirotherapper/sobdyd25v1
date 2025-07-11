import { NextResponse } from 'next/server';
import clientPromise from '../../../../../lib/mongodb';

export async function POST(request: Request) {
  try {
    const db = (await clientPromise).db();
    const { playlistItemId, rating } = await request.json();

    if (!playlistItemId || rating === undefined || rating === null) {
      return NextResponse.json(
        { message: 'Missing track ID or rating' },
        { status: 400 }
      );
    }

    if (typeof rating !== 'number' || rating < 0 || rating > 100) {
      return NextResponse.json(
        { message: 'Rating must be a number between 0 and 100' },
        { status: 400 }
      );
    }

    // Find the playlist containing the item and update the item's rating.
    // This query efficiently finds the correct document and updates only the
    // specific sub-document (the playlist item) in the 'items' array.
    const result = await db
      .collection('playlists')
      .updateOne(
        { 'items._id': playlistItemId },
        { $set: { 'items.$.rating': rating } }
      );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: 'Track not found in any playlist' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Rating updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating rating:', error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'An unknown server error occurred';
    return NextResponse.json(
      { message: 'Error updating rating', error: errorMessage },
      { status: 500 }
    );
  }
}
