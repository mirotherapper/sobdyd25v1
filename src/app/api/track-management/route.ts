import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';
import { PlaylistItemData, SubmissionData, PlaylistData } from '../../../../lib/types';

export async function POST(request: Request) {
  try {
    const { db } = await connectToDatabase();
    const body = await request.json();
    const { draggableId, source, destination } = body;

    if (!draggableId || !source || !destination) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // --- Check for lock status before proceeding ---
    const livePlaylistForLockCheck = await db.collection('playlists').findOne({ is_show_archive: { $ne: true } });

    if (livePlaylistForLockCheck?.is_locked) {
      // Prevent moving a locked track out of its position
      if (source.droppableId === 'queue' && source.index < 10) {
        return NextResponse.json({ message: 'Queue is locked. Cannot move a track from the top 10.' }, { status: 403 });
      }
      // Prevent moving any track into the locked section
      if (destination.droppableId === 'queue' && destination.index < 10) {
        return NextResponse.json({ message: 'Queue is locked. Cannot move a track into the top 10.' }, { status: 403 });
      }
    }

    // --- Main Logic: Moving a Submission to the Queue ---
    if (source.droppableId === 'submissions' && destination.droppableId === 'queue') {
      // 1. Find the original submission
      const submission = await db.collection('submissions').findOne({
        _id: new ObjectId(draggableId)
      });

      if (!submission) {
        return NextResponse.json({ message: 'Submission not found' }, { status: 404 });
      }

      // 2. Find the active playlist
      const livePlaylist = await db.collection('playlists').findOne({ is_show_archive: { $ne: true } });

      if (!livePlaylist) {
        return NextResponse.json({ message: 'Live playlist not found' }, { status: 404 });
      }

      // 3. Create a new playlist item from the submission
      const newPlaylistItem: Omit<PlaylistItemData, 'position'> = {
        _id: new ObjectId().toHexString(), // Assign a unique ID to the playlist item itself
        song: {
          _id: new ObjectId().toHexString(), // This could also be a new song document ID
          title: submission.metadata?.title || submission.url,
          artist: submission.metadata?.artist || 'Unknown Artist',
          url: submission.url,
          platform: 'unknown', // You might determine this from the URL
          artwork: submission.metadata?.artwork || '/placeholder.jpg',
          duration: submission.metadata?.duration || 0,
          submission_message: submission.submission_message,
        },
        status: 'queued',
        tier: submission.submissionType,
        submission_id: submission._id.toString(),
      };

      // 4. Atomically update both collections
      const { client } = await connectToDatabase();
      const session = client.startSession();
      try {
        await session.withTransaction(async () => {
          // Mark submission as approved
          await db.collection('submissions').updateOne(
            { _id: new ObjectId(submission._id) },
            { $set: { status: 'approved' } },
            { session }
          );

          // Add the new item to the playlist's items array
          await db.collection('playlists').updateOne(
            { _id: new ObjectId(livePlaylist._id) },
            { $push: { items: { $each: [newPlaylistItem], $position: destination.index } } } as any,
            { session }
          );
        });
      } finally {
        await session.endSession();
      }

      return NextResponse.json({ message: 'Track moved successfully' }, { status: 200 });
    }

    // --- Logic for reordering within the queue ---
    if (source.droppableId === 'queue' && destination.droppableId === 'queue') {
      const livePlaylist = await db.collection('playlists').findOne({ is_show_archive: { $ne: true } });

      if (!livePlaylist) {
        return NextResponse.json({ message: 'Live playlist not found' }, { status: 404 });
      }

      const allItems = livePlaylist.items || [];
      // Separate the items into 'queued' and 'other' to safely reorder the queue
      const queuedItems = allItems.filter((item: any) => item.status === 'queued').sort((a: any, b: any) => a.position - b.position);
      const otherItems = allItems.filter((item: any) => item.status !== 'queued');

      const movedItemIndex = queuedItems.findIndex((item: any) => item._id === draggableId);
      if (movedItemIndex === -1) {
        return NextResponse.json({ message: 'Track to move not found in queue. State may be out of sync.' }, { status: 404 });
      }

      // Perform the reorder operation on the queued items list
      const [movedItem] = queuedItems.splice(movedItemIndex, 1);
      queuedItems.splice(destination.index, 0, movedItem);

      // Reconstruct the full items array and update the 'position' for every item
      const newFullItemsList = [...otherItems, ...queuedItems].map((item: any, index: number) => ({
        ...item,
        position: index,
      }));

      // Update the entire items array in the database
      await db.collection('playlists').updateOne(
        { _id: new ObjectId(livePlaylist._id) },
        { $set: { items: newFullItemsList } }
      );

      return NextResponse.json({ message: 'Queue reordered successfully' }, { status: 200 });
    }

    // --- Logic for moving from queue to played ---
    if (source.droppableId === 'queue' && destination.droppableId === 'played') {
      const livePlaylist = await db.collection('playlists').findOne({ is_show_archive: { $ne: true } });

      if (!livePlaylist) {
        return NextResponse.json({ message: 'Live playlist not found' }, { status: 404 });
      }

      let allItems = livePlaylist.items || [];

      // Find the item to move by its unique ID
      const movedItemIndex = allItems.findIndex((item: any) => item._id === draggableId);
      if (movedItemIndex === -1) {
        return NextResponse.json({ message: 'Track to move not found. State may be out of sync.' }, { status: 404 });
      }

      // 1. Remove the item from its original position and update its status
      const [movedItem] = allItems.splice(movedItemIndex, 1);
      movedItem.status = 'played';

      // 2. Separate remaining items and insert the moved item into the 'played' list at the new index
      const queuedItems = allItems.filter((item: any) => item.status === 'queued').sort((a: any, b: any) => a.position - b.position);
      const playedItems = allItems.filter((item: any) => item.status === 'played').sort((a: any, b: any) => a.position - b.position);
      const otherItems = allItems.filter((item: any) => item.status !== 'queued' && item.status !== 'played'); // e.g., now_playing
      playedItems.splice(destination.index, 0, movedItem);

      // 3. Reconstruct the full list and recalculate the absolute 'position' for every item
      const newFullItemsList = [...otherItems, ...queuedItems, ...playedItems].map((item: any, index: number) => ({
        ...item,
        position: index,
      }));

      // 4. Update the entire 'items' array in the database
      await db.collection('playlists').updateOne({ _id: new ObjectId(livePlaylist._id) }, { $set: { items: newFullItemsList } });
      return NextResponse.json({ message: 'Track moved to played successfully' }, { status: 200 });
    }
    return NextResponse.json({ message: 'This move operation is not supported' }, { status: 400 });

  } catch (error) {
    console.error('Error in track management:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown server error occurred';
    return NextResponse.json({ message: 'Error managing track', error: errorMessage }, { status: 500 });
  }
}