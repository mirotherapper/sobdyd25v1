export interface ExtractedMetadata {
  title?: string;
  artist?: string;
  artwork?: string;
  duration?: number;
  is_video?: boolean;
}

export type Platform = 'youtube' | 'spotify' | 'soundcloud' | 'bandcamp' | 'local' | 'unknown';

export function detectPlatform(url: string): Platform {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'youtube';
  } else if (url.includes('spotify.com')) {
    return 'spotify';
  } else if (url.includes('soundcloud.com')) {
    return 'soundcloud';
  } else if (url.includes('bandcamp.com')) {
    return 'bandcamp';
  } else if (url.startsWith('file://')) {
    return 'local';
  } else {
    return 'unknown';
  }
}

export function extractMetadata(url: string, platform: Platform): ExtractedMetadata {
  const metadata: ExtractedMetadata = {};

  // This is a simplified client-side extraction. 
  // A robust solution would involve server-side processing and external APIs.

  if (platform === 'youtube') {
    try {
      const urlObj = new URL(url);
      const videoId = urlObj.searchParams.get('v') || urlObj.pathname.split('/').pop();
      if (videoId) {
        metadata.title = `YouTube Video (${videoId})`;
        metadata.artwork = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        metadata.is_video = true;
      }
    } catch (e) {
      console.error("Error parsing YouTube URL:", e);
    }
  } else if (platform === 'spotify') {
    // Basic placeholder for Spotify
    metadata.title = 'Spotify Track';
    metadata.artist = 'Unknown Artist';
    metadata.artwork = '/placeholder.jpg';
  } else if (platform === 'soundcloud') {
    // Basic placeholder for SoundCloud
    metadata.title = 'SoundCloud Track';
    metadata.artist = 'Unknown Artist';
    metadata.artwork = '/placeholder.jpg';
  } else if (platform === 'bandcamp') {
    // Basic placeholder for Bandcamp
    metadata.title = 'Bandcamp Track';
    metadata.artist = 'Unknown Artist';
    metadata.artwork = '/placeholder.jpg';
  }

  return metadata;
}
