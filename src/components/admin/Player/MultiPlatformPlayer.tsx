'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PlaylistItemData } from '@/lib/types';
import PlayerControls from './PlayerControls';

// Platform-specific player components
import YouTubePlayer from './platforms/YouTubePlayer';
import SpotifyPlayer from './platforms/SpotifyPlayer';
import SoundCloudPlayer from './platforms/SoundCloudPlayer';
import BandcampPlayer from './platforms/BandcampPlayer';
import LocalPlayer from './platforms/LocalPlayer';

interface MultiPlatformPlayerProps {
  nowPlaying: PlaylistItemData | null;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onEnd: () => void;
  onNext: () => void;
  className?: string;
}

const MultiPlatformPlayer: React.FC<MultiPlatformPlayerProps> = ({
  nowPlaying,
  isPlaying,
  onPlay,
  onPause,
  onEnd,
  onNext,
  className,
}) => {
  // Player state
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Player references for each platform
  const youtubeRef = useRef<any>(null);
  const spotifyRef = useRef<any>(null);
  const soundcloudRef = useRef<any>(null);
  const bandcampRef = useRef<any>(null);
  const localRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get the active player reference based on platform
  const getActivePlayerRef = useCallback(() => {
    if (!nowPlaying) return null;

    const platform = nowPlaying.metadata?.platform;
    switch (platform) {
      case 'youtube':
        return youtubeRef;
      case 'spotify':
        return spotifyRef;
      case 'soundcloud':
        return soundcloudRef;
      case 'bandcamp':
        return bandcampRef;
      case 'local':
        return localRef;
      default:
        return null;
    }
  }, [nowPlaying]);

  // Update player state when nowPlaying changes
  useEffect(() => {
    setCurrentTime(0);
    setError(null);

    // Set duration from metadata if available
    if (nowPlaying?.metadata?.duration) {
      setDuration(nowPlaying.metadata.duration);
    }
  }, [nowPlaying]);

  // Handle playback state changes
  useEffect(() => {
    const playerRef = getActivePlayerRef();
    if (!playerRef?.current) return;

    if (isPlaying) {
      playerRef.current.play().catch((err: any) => {
        console.error('Play error:', err);
        setError('Failed to play media. Please try again.');
        onPause();
      });
    } else {
      playerRef.current.pause();
    }
  }, [isPlaying, getActivePlayerRef, onPause]);

  // Handle time updates
  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  // Handle duration change
  const handleDurationChange = useCallback((newDuration: number) => {
    if (newDuration && newDuration > 0) {
      setDuration(newDuration);
    }
  }, []);

  // Handle media end
  const handleEnded = useCallback(() => {
    if (isRepeat) {
      const playerRef = getActivePlayerRef();
      if (playerRef?.current) {
        playerRef.current.seek(0);
        playerRef.current.play().catch(console.error);
      }
    } else {
      onEnd();
    }
  }, [isRepeat, getActivePlayerRef, onEnd]);

  // Handle seeking
  const handleSeek = useCallback(
    (time: number) => {
      const playerRef = getActivePlayerRef();
      if (playerRef?.current) {
        playerRef.current.seek(time);
      }
    },
    [getActivePlayerRef]
  );

  // Handle volume change
  const handleVolumeChange = useCallback(
    (newVolume: number) => {
      setVolume(newVolume);

      const playerRef = getActivePlayerRef();
      if (playerRef?.current) {
        playerRef.current.setVolume(newVolume);
      }
    },
    [getActivePlayerRef]
  );

  // Handle fullscreen toggle
  const handleToggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current
        .requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(err => {
          console.error('Failed to enter fullscreen:', err);
        });
    } else {
      document
        .exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch(err => {
          console.error('Failed to exit fullscreen:', err);
        });
    }
  }, []);

  // Handle repeat toggle
  const handleToggleRepeat = useCallback(() => {
    setIsRepeat(prev => !prev);
  }, []);

  // Handle error
  const handleError = useCallback(
    (errorMessage: string) => {
      setError(errorMessage);
      onPause();
    },
    [onPause]
  );

  // Determine which player to render based on platform
  const renderPlayer = () => {
    if (!nowPlaying) return null;

    const platform = nowPlaying.metadata?.platform;
    const url = nowPlaying.url || '';
    const platformId = nowPlaying.metadata?.platformId;

    switch (platform) {
      case 'youtube':
        return (
          <YouTubePlayer
            ref={youtubeRef}
            videoId={platformId || ''}
            url={url}
            volume={volume}
            isPlaying={isPlaying}
            onTimeUpdate={handleTimeUpdate}
            onDurationChange={handleDurationChange}
            onEnded={handleEnded}
            onError={handleError}
          />
        );
      case 'spotify':
        return (
          <SpotifyPlayer
            ref={spotifyRef}
            trackId={platformId || ''}
            url={url}
            volume={volume}
            isPlaying={isPlaying}
            onTimeUpdate={handleTimeUpdate}
            onDurationChange={handleDurationChange}
            onEnded={handleEnded}
            onError={handleError}
          />
        );
      case 'soundcloud':
        return (
          <SoundCloudPlayer
            ref={soundcloudRef}
            trackUrl={url}
            volume={volume}
            isPlaying={isPlaying}
            onTimeUpdate={handleTimeUpdate}
            onDurationChange={handleDurationChange}
            onEnded={handleEnded}
            onError={handleError}
          />
        );
      case 'bandcamp':
        return (
          <BandcampPlayer
            ref={bandcampRef}
            trackUrl={url}
            volume={volume}
            isPlaying={isPlaying}
            onTimeUpdate={handleTimeUpdate}
            onDurationChange={handleDurationChange}
            onEnded={handleEnded}
            onError={handleError}
          />
        );
      case 'local':
        return (
          <LocalPlayer
            ref={localRef}
            fileUrl={url}
            volume={volume}
            isPlaying={isPlaying}
            onTimeUpdate={handleTimeUpdate}
            onDurationChange={handleDurationChange}
            onEnded={handleEnded}
            onError={handleError}
          />
        );
      default:
        return (
          <div className="unsupported-platform">
            Unsupported platform: {platform}
          </div>
        );
    }
  };

  return (
    <div
      className={`multi-platform-player ${className || ''}`}
      ref={containerRef}
    >
      <div className="player-display">
        {error ? (
          <div className="player-error">
            <p>{error}</p>
            <button onClick={() => setError(null)}>Dismiss</button>
          </div>
        ) : (
          <div className="player-content">{renderPlayer()}</div>
        )}
      </div>

      <PlayerControls
        nowPlaying={nowPlaying}
        isPlaying={isPlaying}
        onPlay={onPlay}
        onPause={onPause}
        onNext={onNext}
        onSeek={handleSeek}
        duration={duration}
        currentTime={currentTime}
        volume={volume}
        onVolumeChange={handleVolumeChange}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        isRepeat={isRepeat}
        onToggleRepeat={handleToggleRepeat}
      />
    </div>
  );
};

export default MultiPlatformPlayer;
