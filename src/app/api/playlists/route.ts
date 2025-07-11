import { NextResponse } from 'next/server';
import { getPlaylists, addPlaylistItem } from '@/lib/services/playlistService';

// GET current playlist with queue management following Player Design rules
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const showId = searchParams.get('showId') || 'current';
    const status = searchParams.get('status') || 'queued';
    const limit = parseInt(searchParams.get('limit') || '50');

    // Get playlists using service
    const result = await getPlaylists(showId, status, limit);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error fetching playlist:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch playlist',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST - Add approved submission to playlist queue
export async function POST(request: Request) {
  try {
    const { submissionId, showId, position } = await request.json();

    if (!submissionId) {
      return NextResponse.json(
        {
          error: 'submissionId is required',
        },
        { status: 400 }
      );
    }

    // Add playlist item using service
    const result = await addPlaylistItem(submissionId, showId, position);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error adding to playlist:', error);
    return NextResponse.json(
      {
        error: 'Failed to add to playlist',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
