/**
 * Real-Time Player Component
 * Provides playback control and real-time updates
 * Implements: Real-time status updates, queue management
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { usePlayerState } from '@/lib/hooks/usePlayerState';
import { useImagePreload } from '@/lib/hooks/useImagePreload';
import { extractImageUrls } from '@/lib/utils/performance/imagePreloader';
import NowPlayingDisplay from './NowPlayingDisplay';
import { Play, Pause, SkipForward, RotateCw } from 'lucide-react';
import Loading from '@/components/ui/Loading';
import MultiPlatformPlayer from './MultiPlatformPlayer';

interface PlayerProps {
  showId?: string;
  className?: string;
}

const Player: React.FC<PlayerProps> = ({ showId, className }) => {
  // Track authentication state
  const [isSignedIn, setIsSignedIn] = useState(false);

  // Use our real-time player state hook
  const {
    nowPlaying,
    queue,
    isPlaying,
    isQueueLocked,
    userRating,
    isSavingRating,
    isConnected,
    playControls,
    submitRating,
  } = usePlayerState(showId);

  // Extract artwork URLs from nowPlaying and queue for preloading
  const imagesToPreload = useMemo(() => {
    const images: string[] = [];

    // Add nowPlaying artwork if available
    if (nowPlaying?.metadata?.artwork) {
      images.push(nowPlaying.metadata.artwork);
    }

    // Extract artwork from queue items
    if (queue && queue.length > 0) {
      const queueImages = queue
        .slice(0, 5) // Preload only the next 5 items
        .map(item => item.metadata?.artwork)
        .filter(Boolean) as string[];

      images.push(...queueImages);
    }

    return images;
  }, [nowPlaying, queue]);

  // Preload images
  const { isLoading, errors } = useImagePreload(imagesToPreload);

  // If there are errors, log them
  useEffect(() => {
    if (errors.length > 0) {
      console.warn('Image preloading errors:', errors);
    }
  }, [errors]);

  // Check auth state on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/status');
        if (response.ok) {
          const data = await response.json();
          setIsSignedIn(data.isSignedIn);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      }
    };

    checkAuth();
  }, []);

  return (
    <div className={`player-component ${className || ''}`}>
      {/* Connection status indicator */}
      {!isConnected && (
        <div className="connection-warning">
          <RotateCw className="spin-animation" size={16} />
          Connecting to live updates...
        </div>
      )}

      <div className="player-container">
        {/* Now playing display */}
        <NowPlayingDisplay
          nowPlaying={nowPlaying}
          isPlaying={isPlaying}
          userRating={userRating}
          isSavingRating={isSavingRating}
          isSignedIn={isSignedIn}
          onRatingChange={submitRating}
          className="now-playing-area"
        />

        {/* Multi-platform player */}
        <MultiPlatformPlayer
          nowPlaying={nowPlaying}
          isPlaying={isPlaying}
          onPlay={playControls.play}
          onPause={playControls.pause}
          onEnd={playControls.next}
          onNext={playControls.next}
        />
      </div>
    </div>
  );
};

export default Player;
