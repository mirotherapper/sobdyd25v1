'use client';

import React from 'react';
import Image from 'next/image';
import { Play } from 'lucide-react';
import { PlaylistItemData } from '../../lib/types';

interface NowPlayingCardProps {
  nowPlaying: PlaylistItemData | null;
  userRating: number;
  isSavingRating: boolean;
  isSignedIn: boolean;
  onRatingChange: (newRating: number) => void;
}

const NowPlayingCard: React.FC<NowPlayingCardProps> = ({
  nowPlaying,
  userRating,
  isSavingRating,
  isSignedIn,
  onRatingChange,
}) => {
  return (
    <div className="relative mb-8 w-full overflow-hidden rounded-xl border border-[rgba(255,255,255,0.2)] bg-[rgba(26,26,46,0.7)] p-8 shadow-[0_0_40px_rgba(0,255,255,0.2)] backdrop-blur-[20px]">
      {nowPlaying ? (
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-semibold text-[#FF00FF] [text-shadow:0_0_10px_#FF00FF]">
            <Play className="mr-2 inline" />
            Now Playing
          </h2>
          <Image
            src={nowPlaying.metadata?.artwork || '/default-album-art.jpg'}
            alt="Artwork"
            width={192}
            height={192}
            className="mx-auto mb-4 h-48 w-48 rounded-xl shadow-lg"
          />
          <p className="text-2xl font-bold">
            {nowPlaying.metadata?.title || 'Unknown Trax'}
          </p>
          <p className="mb-4 text-lg text-gray-300">
            {nowPlaying.metadata?.artist || 'Unknown Artist'}
          </p>

          <div className="mt-4 w-full">
            <label
              htmlFor="guest-rating"
              className="mb-1 block text-sm font-medium text-gray-400"
            >
              Your Rating: {userRating}
            </label>
            <input
              id="guest-rating"
              type="range"
              min="0"
              max="100"
              value={userRating}
              onChange={e => onRatingChange(parseInt(e.target.value, 10))}
              disabled={!isSignedIn}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-700 disabled:cursor-not-allowed"
            />
            {isSavingRating && (
              <p className="mt-1 animate-pulse text-xs text-cyan-400">
                Saving...
              </p>
            )}
            {!isSignedIn && (
              <p className="mt-1 text-xs text-gray-500">
                Sign in to submit your rating.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex h-96 flex-col items-center justify-center text-center">
          <h2 className="mb-4 text-2xl font-semibold text-gray-400">
            Stay on Beat
          </h2>
          <p className="text-gray-500">
            The show is not currently live. Check back soon!
          </p>
        </div>
      )}
    </div>
  );
};

export default NowPlayingCard;
