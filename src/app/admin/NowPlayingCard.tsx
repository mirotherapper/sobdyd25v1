"use client";

import React from 'react';
import { Play } from 'lucide-react';
import { PlaylistItemData } from '../../../lib/types';
import { getArtistName } from '../../../lib/utils';

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
    <div
      className="w-full p-8 rounded-xl relative overflow-hidden mb-8 bg-[rgba(26,26,46,0.7)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] shadow-[0_0_40px_rgba(0,255,255,0.2)]"
    >
      {nowPlaying ? (
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4 text-[#FF00FF] [text-shadow:0_0_10px_#FF00FF]">
            <Play className="inline mr-2" />
            Now Playing
          </h2>
          <img src={nowPlaying.song.artwork} alt="Artwork" className="w-48 h-48 rounded-xl mb-4 shadow-lg mx-auto" />
          <p className="text-2xl font-bold">{nowPlaying.song.title}</p>
          <p className="text-lg text-gray-300 mb-4">
            {getArtistName(nowPlaying.song.artist)}
          </p>

          <div className="w-full mt-4">
            <label htmlFor="guest-rating" className="block text-sm font-medium text-gray-400 mb-1">
              Your Rating: {userRating}
            </label>
            <input
              id="guest-rating"
              type="range"
              min="0"
              max="100"
              value={userRating}
              onChange={(e) => onRatingChange(parseInt(e.target.value, 10))}
              disabled={!isSignedIn}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed"
            />
            {isSavingRating && <p className="text-xs text-cyan-400 mt-1 animate-pulse">Saving...</p>}
            {!isSignedIn && <p className="text-xs text-gray-500 mt-1">Sign in to submit your rating.</p>}
          </div>
        </div>
      ) : (
        <div className="text-center h-96 flex flex-col justify-center items-center">
          <h2 className="text-2xl font-semibold mb-4 text-gray-400">Stay on Beat</h2>
          <p className="text-gray-500">The show is not currently live. Check back soon!</p>
        </div>
      )}
    </div>
  );
};

export default NowPlayingCard;