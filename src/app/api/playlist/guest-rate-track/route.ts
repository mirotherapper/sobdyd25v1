import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectToDatabase } from '../../../../../lib/mongodb';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const { playlistItemId, rating } = await request.json();

    if (!playlistItemId || rating === undefined || rating === null) {
      return NextResponse.json({ message: 'Missing track ID or rating' }, { status: 400 });
    }

    if (typeof rating !== 'number' || rating < 0 || rating > 100) {
      return NextResponse.json({ message: 'Rating must be a number between 0 and 100' }, { status: 400 });
    }

    // First, try to update an existing rating for this user on this track.
    const updateResult = await db.collection('playlists').updateOne(
      { 
        "items._id": playlistItemId, 
        "items.guestRatings.userId": userId 
      },
      { 
        $set: { 
          "items.$[item].guestRatings.$[guest].rating": rating 
        } 
      },
      { 
        arrayFilters: [
          { "item._id": playlistItemId },
          { "guest.userId": userId }
        ]
      }
    );

    // If no document was matched, the user hasn't rated this track before. Add their rating.
    if (updateResult.matchedCount === 0) {
      const pushResult = await db.collection('playlists').updateOne(
        { "items._id": playlistItemId },
        { 
          $push: { 
            "items.$[item].guestRatings": { userId, rating } 
          } 
        } as any,
        { 
          arrayFilters: [{ "item._id": playlistItemId }]
        }
      );

      if (pushResult.modifiedCount === 0) {
        return NextResponse.json({ message: 'Track not found in any playlist' }, { status: 404 });
      }
    }

    return NextResponse.json({ message: 'Rating submitted successfully' }, { status: 200 });

  } catch (error) {
    console.error('Error submitting guest rating:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown server error occurred';
    return NextResponse.json({ message: 'Error submitting rating', error: errorMessage }, { status: 500 });
  }
}