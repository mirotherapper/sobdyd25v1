import { PlaylistItemData } from './types';

/**
 * Formats the artist's name for display.
 * Handles cases where the artist is a string or an object.
 */
export const getArtistName = (artist: PlaylistItemData['song']['artist']): string => {
  return typeof artist === 'string' ? artist : artist?.name || 'N/A';
};