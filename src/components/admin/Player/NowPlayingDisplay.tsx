/**
 * Now Playing Display Component
 * Shows the currently playing track with detailed info and rating system
 */

'use client';

import React from 'react';
import Image from 'next/image';
import { PlaylistItemData } from '@/lib/types';
import { Music, Star, Clock } from 'lucide-react';

interface NowPlayingDisplayProps {
  nowPlaying: PlaylistItemData | null;
  isPlaying: boolean;
  userRating: number;
  isSavingRating: boolean;
  isSignedIn: boolean;
  onRatingChange: (rating: number) => void;
  className?: string;
}

const NowPlayingDisplay: React.FC<NowPlayingDisplayProps> = ({
  nowPlaying,
  isPlaying,
  userRating,
  isSavingRating,
  isSignedIn,
  onRatingChange,
  className,
}) => {
  // Format duration to MM:SS
  const formatDuration = (seconds: number) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Empty state
  if (!nowPlaying) {
    return (
      <div className={`now-playing-empty ${className || ''}`}>
        <div className="empty-artwork">
          <Music size={48} className="empty-icon" />
        </div>
        <div className="empty-text">
          <h3>No trax currently playing</h3>
          <p>Queue is empty or show is not live</p>
        </div>
      </div>
    );
  }

  // Calculate submission Que-Up badge style
  const getQueUpBadgeClass = (queUp: string) => {
    switch (queUp) {
      case 'VIP':
        return 'que-up-badge-vip';
      case 'Skip':
        return 'que-up-badge-skip';
      case 'GA':
        return 'que-up-badge-ga';
      case 'Free':
        return 'que-up-badge-free';
      default:
        return 'que-up-badge-default';
    }
  };

  return (
    <div className={`now-playing-display ${className || ''}`}>
      <div className="now-playing-header">
        <div className={`status-indicator ${isPlaying ? 'playing' : 'paused'}`}>
          <span className="status-dot" />
          {isPlaying ? 'Now Playing' : 'Paused'}
        </div>
      </div>

      <div className="now-playing-content">
        <div className="artwork-container">
          <Image
            src={nowPlaying.metadata?.artwork || '/default-artwork.jpg'}
            alt={nowPlaying.metadata?.title || 'Now Playing'}
            width={300}
            height={300}
            className="artwork"
            priority
          />
        </div>

        <div className="track-details">
          <h2 className="track-title">
            {nowPlaying.metadata?.title || 'Unknown Trax'}
          </h2>
          <h3 className="track-artist">
            {nowPlaying.metadata?.artist || 'Unknown Artist'}
          </h3>

          <div className="track-metadata">
            {nowPlaying.metadata?.duration && (
              <div className="duration">
                <Clock size={16} />
                <span>{formatDuration(nowPlaying.metadata.duration)}</span>
              </div>
            )}

            {nowPlaying.submission?.tier && (
              <div
                className={`que-up-badge ${getQueUpBadgeClass(nowPlaying.submission.tier)}`}
              >
                {nowPlaying.submission.tier}
              </div>
            )}

            {nowPlaying.submission?.submittedBy && (
              <div className="submitter">
                Submitted by: {nowPlaying.submission.submittedBy}
              </div>
            )}

            {nowPlaying.metadata?.platform && (
              <div className="platform-badge">
                {nowPlaying.metadata.platform}
              </div>
            )}
          </div>

          {nowPlaying.submission?.submission_message && (
            <div className="submission-message">
              <blockquote>
                "{nowPlaying.submission.submission_message}"
              </blockquote>
            </div>
          )}

          <div className="rating-container">
            <div className="rating-header">
              <Star size={16} />
              <span>Your Rating</span>
              {isSavingRating && (
                <span className="saving-indicator">Saving...</span>
              )}
            </div>

            <div className="rating-control">
              <input
                type="range"
                min="0"
                max="100"
                value={userRating}
                onChange={e => onRatingChange(parseInt(e.target.value, 10))}
                disabled={!isSignedIn || isSavingRating}
                className="rating-slider"
              />
              <div className="rating-value">{userRating}</div>
            </div>

            {!isSignedIn && (
              <p className="sign-in-prompt">Sign in to rate trax</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NowPlayingDisplay;
