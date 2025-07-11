'use client';

import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from 'react';

interface YouTubePlayerProps {
  videoId: string;
  url: string;
  volume: number;
  isPlaying: boolean;
  onTimeUpdate: (time: number) => void;
  onDurationChange: (duration: number) => void;
  onEnded: () => void;
  onError: (message: string) => void;
}

interface YouTubePlayerAPI {
  play: () => Promise<void>;
  pause: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
}

interface YouTubePlayerState {
  player: YT.Player | null;
  videoId: string;
  isReady: boolean;
  timeUpdateInterval: NodeJS.Timeout | null;
}

// YouTube Player component with forwardRef to expose API methods
const YouTubePlayer = forwardRef<YouTubePlayerAPI, YouTubePlayerProps>(
  (
    {
      videoId,
      url,
      volume,
      isPlaying,
      onTimeUpdate,
      onDurationChange,
      onEnded,
      onError,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const state = useRef<YouTubePlayerState>({
      player: null,
      videoId,
      isReady: false,
      timeUpdateInterval: null,
    });

    // Extract video ID from URL if not provided directly
    useEffect(() => {
      if (!videoId && url) {
        try {
          // Extract videoId from YouTube URL
          let extractedId = '';
          const urlObj = new URL(url);

          if (urlObj.hostname.includes('youtube.com')) {
            extractedId = urlObj.searchParams.get('v') || '';
          } else if (urlObj.hostname.includes('youtu.be')) {
            extractedId = urlObj.pathname.slice(1);
          }

          if (extractedId) {
            state.current.videoId = extractedId;
          } else {
            onError('Could not extract YouTube video ID');
          }
        } catch (error) {
          console.error('Error parsing YouTube URL:', error);
          onError('Invalid YouTube URL');
        }
      } else {
        state.current.videoId = videoId;
      }
    }, [videoId, url, onError]);

    // Load YouTube API
    useEffect(() => {
      if (!window.YT) {
        // Create YouTube API script tag
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';

        // Add API ready callback to window
        window.onYouTubeIframeAPIReady = () => {
          initPlayer();
        };

        // Append script to document
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      } else if (window.YT.Player) {
        // API already loaded
        initPlayer();
      }

      return () => {
        // Cleanup
        if (state.current.timeUpdateInterval) {
          clearInterval(state.current.timeUpdateInterval);
          state.current.timeUpdateInterval = null;
        }

        if (state.current.player) {
          state.current.player.destroy();
          state.current.player = null;
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Initialize YouTube player
    const initPlayer = () => {
      if (!containerRef.current) return;

      try {
        state.current.player = new YT.Player(containerRef.current, {
          videoId: state.current.videoId,
          height: '100%',
          width: '100%',
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            enablejsapi: 1,
            fs: 0,
            iv_load_policy: 3, // Hide annotations
            modestbranding: 1,
            playsinline: 1,
            rel: 0, // Don't show related videos
            showinfo: 0,
          },
          events: {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange,
            onError: onPlayerError,
          },
        });
      } catch (error) {
        console.error('Error initializing YouTube player:', error);
        onError('Failed to initialize YouTube player');
      }
    };

    // Player ready handler
    const onPlayerReady = (event: YT.PlayerEvent) => {
      state.current.isReady = true;

      // Set initial volume
      event.target.setVolume(volume * 100);

      // Set up time update interval
      state.current.timeUpdateInterval = setInterval(() => {
        if (state.current.player && state.current.isReady) {
          try {
            const currentTime = state.current.player.getCurrentTime();
            onTimeUpdate(currentTime);
          } catch (error) {
            console.error('Error getting current time:', error);
          }
        }
      }, 250);

      // Get duration
      try {
        const duration = event.target.getDuration();
        onDurationChange(duration);
      } catch (error) {
        console.error('Error getting duration:', error);
      }

      // Play if needed
      if (isPlaying) {
        event.target.playVideo();
      }
    };

    // Player state change handler
    const onPlayerStateChange = (event: YT.OnStateChangeEvent) => {
      if (event.data === YT.PlayerState.ENDED) {
        onEnded();
      } else if (event.data === YT.PlayerState.PLAYING) {
        // Update duration when playing starts
        const duration = event.target.getDuration();
        onDurationChange(duration);
      }
    };

    // Player error handler
    const onPlayerError = (event: YT.OnErrorEvent) => {
      let errorMessage;

      switch (event.data) {
        case 2:
          errorMessage = 'Invalid YouTube video ID';
          break;
        case 5:
          errorMessage = 'HTML5 player error';
          break;
        case 100:
          errorMessage = 'Video not found or removed';
          break;
        case 101:
        case 150:
          errorMessage = 'Video owner does not allow embedding';
          break;
        default:
          errorMessage = `YouTube player error (${event.data})`;
      }

      onError(errorMessage);
    };

    // Update player when props change
    useEffect(() => {
      if (!state.current.player || !state.current.isReady) return;

      try {
        // Update volume
        state.current.player.setVolume(volume * 100);

        // Handle play/pause
        if (isPlaying) {
          if (
            state.current.player.getPlayerState() !== YT.PlayerState.PLAYING
          ) {
            state.current.player.playVideo();
          }
        } else {
          if (
            state.current.player.getPlayerState() === YT.PlayerState.PLAYING
          ) {
            state.current.player.pauseVideo();
          }
        }
      } catch (error) {
        console.error('Error updating YouTube player:', error);
      }
    }, [isPlaying, volume]);

    // Expose player methods via ref
    useImperativeHandle(ref, () => ({
      play: async () => {
        if (state.current.player && state.current.isReady) {
          state.current.player.playVideo();
          return Promise.resolve();
        }
        return Promise.reject('Player not ready');
      },
      pause: () => {
        if (state.current.player && state.current.isReady) {
          state.current.player.pauseVideo();
        }
      },
      seek: (time: number) => {
        if (state.current.player && state.current.isReady) {
          state.current.player.seekTo(time, true);
        }
      },
      setVolume: (volume: number) => {
        if (state.current.player && state.current.isReady) {
          state.current.player.setVolume(volume * 100);
        }
      },
    }));

    return (
      <div className="youtube-player-container">
        <div ref={containerRef} className="youtube-player" />
      </div>
    );
  }
);

YouTubePlayer.displayName = 'YouTubePlayer';

export default YouTubePlayer;
