'use client';

import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useState,
  useCallback,
} from 'react';

interface BandcampPlayerProps {
  trackUrl: string;
  volume: number;
  isPlaying: boolean;
  onTimeUpdate: (time: number) => void;
  onDurationChange: (duration: number) => void;
  onEnded: () => void;
  onError: (message: string) => void;
}

interface BandcampPlayerAPI {
  play: () => Promise<void>;
  pause: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
}

// Bandcamp Player component with forwardRef to expose API methods
const BandcampPlayer = forwardRef<BandcampPlayerAPI, BandcampPlayerProps>(
  (
    {
      trackUrl,
      isPlaying,
      onTimeUpdate,
      onDurationChange,
      onEnded,
    },
    ref
  ) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [isReady, setIsReady] = useState(false);
    const timeUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const setCurrentTime = useState(0)[1];
    const [duration, setDuration] = useState(0);

    // Extract album/track ID from Bandcamp URL
const extractBandcampId = (url: string) => {
      try {
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/');

        // Look for album or track ID in path
        if (pathParts.includes('album') || pathParts.includes('track')) {
          return {
            type: pathParts.includes('album') ? 'album' : 'track',
            id:
              pathParts[pathParts.length - 1] ||
              pathParts[pathParts.length - 2],
          };
        }

        return null;
      } catch (error) {
        console.error('Error parsing Bandcamp URL:', error);
        return null;
      }
    };

    // Generate embed URL for Bandcamp
    const generateEmbedUrl = (url: string) => {
      const bandcampInfo = extractBandcampId(url);

      if (!bandcampInfo) {
        // Fallback: try to convert the URL to embed format
        return (
          url
            .replace('/album/', '/EmbeddedPlayer/album=')
            .replace('/track/', '/EmbeddedPlayer/track=') +
          '/size=large/bgcol=ffffff/linkcol=0687f5/tracklist=false/artwork=small/'
        );
      }

      // For proper Bandcamp embed URLs
      const baseUrl = url.split('.com')[0] + '.com';
      return `${baseUrl}/EmbeddedPlayer/${bandcampInfo.type}=${bandcampInfo.id}/size=large/bgcol=ffffff/linkcol=0687f5/tracklist=false/artwork=small/`;
    };

    // Stop time update interval
    const stopTimeUpdates = useCallback(() => {
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
        timeUpdateIntervalRef.current = null;
      }
    }, []);

    // Start time update interval (simulated for Bandcamp)
    const startTimeUpdates = useCallback(() => {
      if (timeUpdateIntervalRef.current) return;

      timeUpdateIntervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1;
          onTimeUpdate(newTime);

          // Check if track ended (simulated)
          if (newTime >= duration) {
            stopTimeUpdates();
            onEnded();
            return 0;
          }

          return newTime;
        });
      }, 1000);
    }, [onTimeUpdate, duration, onEnded, stopTimeUpdates]);

    // Initialize player
    useEffect(() => {
      if (trackUrl) {
        setIsReady(true);

        // Since Bandcamp doesn't have a robust API, we'll simulate some functionality
        setDuration(180); // Default 3 minutes
        onDurationChange(180);

        // Start time updates if playing
        if (isPlaying) {
          startTimeUpdates();
        }
      }

      return () => {
        stopTimeUpdates();
      };
    }, [trackUrl, isPlaying, onDurationChange, startTimeUpdates, stopTimeUpdates]);

    // Handle play/pause changes
    useEffect(() => {
      if (isReady) {
        if (isPlaying) {
          startTimeUpdates();
        } else {
          stopTimeUpdates();
        }
      }
    }, [isReady, isPlaying, startTimeUpdates, stopTimeUpdates]);

    // Expose player methods via ref
    useImperativeHandle(
      ref,
      () => ({
        play: async () => {
          // Bandcamp iframe doesn't support programmatic control
          // This is a limitation of Bandcamp's embed system
          console.log('Bandcamp play - manual control required');
          return Promise.resolve();
        },
        pause: () => {
          // Bandcamp iframe doesn't support programmatic control
          console.log('Bandcamp pause - manual control required');
          stopTimeUpdates();
        },
        seek: (time: number) => {
          // Bandcamp iframe doesn't support programmatic seeking
          console.log('Bandcamp seek - not supported');
          setCurrentTime(time);
          onTimeUpdate(time);
        },
        setVolume: (vol: number) => {
          // Bandcamp iframe doesn't support programmatic volume control
          console.log('Bandcamp volume - manual control required');
        },
      }),
      [startTimeUpdates, stopTimeUpdates, onTimeUpdate]
    );

    if (!trackUrl) {
      return (
        <div className="bandcamp-player-error">
          <p>No Bandcamp URL provided</p>
        </div>
      );
    }

    const embedUrl = generateEmbedUrl(trackUrl);

    return (
      <div className="bandcamp-player-container">
        <iframe
          ref={iframeRef}
          style={{ border: 0, width: '100%', height: '120px' }}
          src={embedUrl}
          seamless
          title="Bandcamp Player"
        />
        <div className="bandcamp-notice">
          <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
            Note: Bandcamp players require manual control. Use the play/pause
            buttons in the embedded player above.
          </p>
        </div>
        {!isReady && (
          <div className="bandcamp-loading">
            <p>Loading Bandcamp player...</p>
          </div>
        )}
      </div>
    );
  }
);

BandcampPlayer.displayName = 'BandcampPlayer';

export default BandcampPlayer;
