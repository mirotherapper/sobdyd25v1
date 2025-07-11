import { auth } from '@clerk/nextjs/server';
import {
  getActivePlaylist,
  playNextTrack,
} from '../../../../lib/services/api/playlistService';
import {
  createErrorResponse,
  createSuccessResponse,
  handleApiError,
} from '../../../../lib/utils/api-utils';

export async function POST() {
  try {
    // Get admin authentication
    const { userId } = await auth();
    if (!userId) {
      return createErrorResponse(
        'AuthenticationRequired',
        'You must be signed in as an admin to advance the playlist',
        401
      );
    }

    // Get the active playlist
    const activePlaylist = await getActivePlaylist();
    if (!activePlaylist) {
      return createErrorResponse('NotFound', 'No active playlist found', 404);
    }

    // Check if playlist is locked
    if (activePlaylist.isLocked) {
      return createErrorResponse(
        'PlaylistLocked',
        'Cannot modify a locked playlist',
        403
      );
    }

    try {
      // Play the next track
      const nextTrack = await playNextTrack((activePlaylist as any)._id);
      return createSuccessResponse({
        message: 'Track is now playing',
        nowPlaying: nextTrack,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'No tracks in queue') {
        return createSuccessResponse({
          message: 'Queue is empty. Nothing to play.',
        });
      }
      throw error; // Re-throw for the outer catch block
    }
  } catch (error) {
    return handleApiError(error);
  }
}
