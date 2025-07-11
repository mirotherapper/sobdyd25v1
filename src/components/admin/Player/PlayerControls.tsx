'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { PlaylistItemData } from '@/lib/types';

interface PlayerControlsProps {
  nowPlaying: PlaylistItemData | null;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onSeek: (time: number) => void;
  duration: number;
  currentTime: number;
  volume: number;
  onVolumeChange: (volume: number) => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  isRepeat: boolean;
  onToggleRepeat: () => void;
  className?: string;
}

const PlayerControls: React.FC<PlayerControlsProps> = ({
  nowPlaying,
  isPlaying,
  onPlay,
  onPause,
  onNext,
  onSeek,
  duration,
  currentTime,
  volume,
  onVolumeChange,
  isFullscreen,
  onToggleFullscreen,
  isRepeat,
  onToggleRepeat,
  className,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(volume);
  const [isDragging, setIsDragging] = useState(false);
  const [dragValue, setDragValue] = useState(currentTime);
  const progressRef = useRef<HTMLDivElement>(null);

  // Update drag value when current time changes (if not dragging)
  useEffect(() => {
    if (!isDragging) {
      setDragValue(currentTime);
    }
  }, [currentTime, isDragging]);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Handle progress bar clicks
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !duration) return;

    const rect = progressRef.current.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;
    const newTime = clickPosition * duration;

    onSeek(newTime);
  };

  // Handle progress bar drag start
  const handleDragStart = () => {
    setIsDragging(true);
  };

  // Handle progress bar drag end
  const handleDragEnd = () => {
    if (isDragging) {
      onSeek(dragValue);
      setIsDragging(false);
    }
  };

  // Handle progress bar drag
  const handleDrag = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDragValue(parseFloat(e.target.value));
  };

  // Handle volume changes
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    onVolumeChange(newVolume);

    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  // Handle mute toggle
  const handleMuteToggle = () => {
    if (isMuted) {
      setIsMuted(false);
      onVolumeChange(previousVolume === 0 ? 0.5 : previousVolume);
    } else {
      setPreviousVolume(volume);
      setIsMuted(true);
      onVolumeChange(0);
    }
  };

  return (
    <div className={`player-controls ${className || ''}`}>
      {/* Progress bar */}
      <div className="progress-container">
        <div className="time-display current">{formatTime(currentTime)}</div>

        <div
          className="progress-bar"
          ref={progressRef}
          onClick={handleProgressClick}
        >
          <div
            className="progress-fill"
            style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
          />
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={isDragging ? dragValue : currentTime}
            className="progress-slider"
            onMouseDown={handleDragStart}
            onMouseUp={handleDragEnd}
            onTouchStart={handleDragStart}
            onTouchEnd={handleDragEnd}
            onChange={handleDrag}
            disabled={!nowPlaying}
          />
        </div>

        <div className="time-display duration">{formatTime(duration || 0)}</div>
      </div>

      {/* Control buttons */}
      <div className="controls-main">
        <button
          className={`control-button repeat-button ${isRepeat ? 'active' : ''}`}
          onClick={onToggleRepeat}
          disabled={!nowPlaying}
          aria-label={isRepeat ? 'Disable repeat' : 'Enable repeat'}
        >
          <Repeat size={20} />
        </button>

        {isPlaying ? (
          <button
            className="control-button pause-button"
            onClick={onPause}
            disabled={!nowPlaying}
            aria-label="Pause"
          >
            <Pause size={24} />
          </button>
        ) : (
          <button
            className="control-button play-button"
            onClick={onPlay}
            disabled={!nowPlaying}
            aria-label="Play"
          >
            <Play size={24} />
          </button>
        )}

        <button
          className="control-button next-button"
          onClick={onNext}
          disabled={!nowPlaying}
          aria-label="Next track"
        >
          <SkipForward size={20} />
        </button>
      </div>

      {/* Volume and fullscreen controls */}
      <div className="controls-secondary">
        <div className="volume-control">
          <button
            className="control-button volume-button"
            onClick={handleMuteToggle}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX size={20} />
            ) : (
              <Volume2 size={20} />
            )}
          </button>

          <div className="volume-slider-container">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="volume-slider"
              aria-label="Volume"
            />
          </div>
        </div>

        <button
          className="control-button fullscreen-button"
          onClick={onToggleFullscreen}
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
        </button>
      </div>
    </div>
  );
};

export default PlayerControls;
