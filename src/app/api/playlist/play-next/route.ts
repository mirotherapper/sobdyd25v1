import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../../lib/mongodb';
import { PlaylistData, PlaylistItemData } from '../../../../../lib/types';
import { ObjectId } from 'mongodb';

export async function POST(request: Request) {
  const { client, db } = await connectToDatabase();
  const session = client.startSession();

  try {
    let resultMessage = 'Track is now playing.';
    await session.withTransaction(async () => {
      // 1. Find the active playlist
      const livePlaylist = await db.collection<PlaylistData>('playlists').findOne(
        { is_show_archive: { $ne: true } },
        { session }
      );

      if (!livePlaylist) {
        throw new Error('Live playlist not found');
      }

      let items = livePlaylist.items || [];

      // 2. Find the top item in the queue
      const queuedItems = items.filter(item => item.status === 'queued').sort((a, b) => a.position - b.position);
      if (queuedItems.length === 0) {
        resultMessage = 'Queue is empty. Nothing to play.';
        // We can abort the transaction early if there's nothing to do.
        await session.abortTransaction();
        return;
      }
      const nextTrackToPlay = queuedItems[0];

      // 3. Update statuses
      items.forEach(item => {
        // Move current 'now_playing' to 'played'
        if (item.status === 'now_playing') {
          item.status = 'played';
        }
        // Move the next track to 'now_playing'
        if (item._id === nextTrackToPlay._id) {
          item.status = 'now_playing';
        }
      });

      // 4. Recalculate all positions to ensure data integrity
      const newFullItemsList = items.map((item, index) => ({
        ...item,
        position: index,
      }));

      // 5. Update the entire playlist in the database
      await db.collection('playlists').updateOne(
        { _id: new ObjectId(livePlaylist._id) },
        { $set: { items: newFullItemsList } },
        { session }
      );
    });
    return NextResponse.json({ message: resultMessage }, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown server error occurred';
    return NextResponse.json({ message: 'Error advancing playlist', error: errorMessage }, { status: 500 });
  } finally {
    await session.endSession();
  }
}