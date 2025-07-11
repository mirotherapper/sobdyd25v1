import { NextResponse } from 'next/server';
import clientPromise from '../../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: Request) {
  try {
    const db = (await clientPromise).db();
    const { submissionId } = await request.json();

    if (!submissionId) {
      return NextResponse.json(
        { error: 'Submission ID is required' },
        { status: 400 }
      );
    }

    // Update submission status to approved
    const result = await db.collection('submissions').updateOne(
      { _id: new ObjectId(submissionId) },
      {
        $set: {
          status: 'approved',
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    // Get the approved submission to add to playlist
    const submission = await db
      .collection('submissions')
      .findOne({ _id: new ObjectId(submissionId) });

    if (submission) {
      // Create a song document first
      const songData = {
        title: submission.metadata?.title || 'Unknown Track',
        artist: submission.metadata?.artist || 'Unknown Artist',
        url: submission.url,
        platform: submission.platform,
        artwork: submission.metadata?.artwork || '/default-album-art.jpg',
        duration: submission.metadata?.duration || 0,
        is_video: submission.metadata?.is_video || false,
        createdAt: new Date(),
      };

      const songResult = await db.collection('songs').insertOne(songData);

      // Find or create live playlist
      let livePlaylist = await db
        .collection('playlists')
        .findOne({ name: 'Live Show' });

      if (!livePlaylist) {
        // Create live playlist if it doesn't exist
        const playlistResult = await db.collection('playlists').insertOne({
          name: 'Live Show',
          items: [],
          is_show_archive: false,
          is_locked: false,
          created_at: new Date(),
        });
        livePlaylist = await db
          .collection('playlists')
          .findOne({ _id: playlistResult.insertedId });
      }

      // Get next position in queue
      const nextPosition = (livePlaylist?.items || []).length;

      // Create playlist item
      const playlistItem = {
        _id: new ObjectId(),
        song: songResult.insertedId,
        position: nextPosition,
        status: 'queued',
        tier: submission.submissionType,
        submission_id: submissionId,
      };

      // Add to playlist
      await db.collection('playlists').updateOne({ _id: livePlaylist?._id }, {
        $push: { items: playlistItem },
      } as any);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error approving submission:', error);
    return NextResponse.json(
      {
        error: 'Failed to approve submission',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
