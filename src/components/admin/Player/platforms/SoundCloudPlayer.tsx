'use client';

import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useState,
} from 'react';

interface SoundCloudPlayerProps {
  trackUrl: string;
  volume: number;
  isPlaying: boolean;
  onTimeUpdate: (time: number) => void;
  onDurationChange: (duration: number) => void;
  onEnded: () => void;
  onError: (message: string) => void;
}

interface SoundCloudPlayerAPI {
  play: () => Promise<void>;
  pause: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
}

// SoundCloud Player component with forwardRef to expose API methods
const SoundCloudPlayer = forwardRef<SoundCloudPlayerAPI, SoundCloudPlayerProps>(
  (
    {
      trackUrl,
      volume,
      isPlaying,
      onTimeUpdate,
      onDurationChange,
      onEnded,
      onError,
    },
    ref
  ) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [widget, setWidget] = useState<any>(null);
    const [isReady, setIsReady] = useState(false);
    const timeUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Load SoundCloud Widget API
    useEffect(() => {
      const loadSoundCloudAPI = () => {
        if (window.SC && window.SC.Widget) {
          initializeWidget();
          return;
        }

        // Load the SoundCloud Widget API
        const script = document.createElement('script');
        script.src = 'https://w.soundcloud.com/player/api.js';
        script.async = true;
        script.onload = () => {
          initializeWidget();
        };
        document.head.appendChild(script);
      };

      const initializeWidget = () => {
        if (!iframeRef.current) return;

        try {
          const newWidget = window.SC.Widget(iframeRef.current);
          setWidget(newWidget);

          // Set up event listeners
          newWidget.bind(window.SC.Widget.Events.READY, () => {
            setIsReady(true);

            // Set initial volume
            newWidget.setVolume(volume * 100);

            // Get duration
            newWidget.getDuration((duration: number) => {
              onDurationChange(duration / 1000); // Convert ms to seconds
            });

            // Start time updates if playing
            if (isPlaying) {
              startTimeUpdates(newWidget);
            }
          });

          newWidget.bind(window.SC.Widget.Events.PLAY, () => {
            startTimeUpdates(newWidget);
          });

          newWidget.bind(window.SC.Widget.Events.PAUSE, () => {
            stopTimeUpdates();
          });

          newWidget.bind(window.SC.Widget.Events.FINISH, () => {
            stopTimeUpdates();
            onEnded();
          });

          newWidget.bind(window.SC.Widget.Events.ERROR, () => {
            onError('SoundCloud playback error');
          });
        } catch (error) {
          console.error('Error initializing SoundCloud widget:', error);
          onError('Failed to initialize SoundCloud player');
        }
      };

      if (trackUrl) {
        loadSoundCloudAPI();
      }

      return () => {
        stopTimeUpdates();
      };
    }, [trackUrl]);

    // Start time update interval
    const startTimeUpdates = (widgetInstance: any) => {
      if (timeUpdateIntervalRef.current) return;

      timeUpdateIntervalRef.current = setInterval(() => {
        if (widgetInstance && isReady) {
          widgetInstance.getPosition((position: number) => {
            onTimeUpdate(position / 1000); // Convert ms to seconds
          });
        }
      }, 1000);
    };

    // Stop time update interval
    const stopTimeUpdates = () => {
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
        timeUpdateIntervalRef.current = null;
      }
    };

    // Handle volume changes
    useEffect(() => {
      if (widget && isReady) {
        widget.setVolume(volume * 100);
      }
    }, [widget, isReady, volume]);

    // Handle play/pause changes
    useEffect(() => {
      if (widget && isReady) {
        if (isPlaying) {
          widget.play();
        } else {
          widget.pause();
        }
      }
    }, [widget, isReady, isPlaying]);

    // Expose player methods via ref
    useImperativeHandle(
      ref,
      () => ({
        play: async () => {
          if (widget && isReady) {
            widget.play();
          }
        },
        pause: () => {
          if (widget && isReady) {
            widget.pause();
          }
        },
        seek: (time: number) => {
          if (widget && isReady) {
            widget.seekTo(time * 1000); // Convert seconds to ms
          }
        },
        setVolume: (vol: number) => {
          if (widget && isReady) {
            widget.setVolume(vol * 100);
          }
        },
      }),
      [widget, isReady]
    );

    // Generate embed URL
    const getEmbedUrl = (url: string) => {
      const baseUrl = 'https://w.soundcloud.com/player/';
      const params = new URLSearchParams({
        url: url,
        color: '%23ff5500',
        auto_play: 'false',
        hide_related: 'false',
        show_comments: 'true',
        show_user: 'true',
        show_reposts: 'false',
        show_teaser: 'true',
        visual: 'true',
      });
      return `${baseUrl}?${params.toString()}`;
    };

    if (!trackUrl) {
      return (
        <div className="soundcloud-player-error">
          <p>No SoundCloud URL provided</p>
        </div>
      );
    }

    return (
      <div className="soundcloud-player-container">
        <iframe
          ref={iframeRef}
          width="100%"
          height="300"
          scrolling="no"
          frameBorder="no"
          allow="autoplay"
          src={getEmbedUrl(trackUrl)}
          title="SoundCloud Player"
        />
        {!isReady && (
          <div className="soundcloud-loading">
            <p>Loading SoundCloud player...</p>
          </div>
        )}
      </div>
    );
  }
);

SoundCloudPlayer.displayName = 'SoundCloudPlayer';

export default SoundCloudPlayer;
