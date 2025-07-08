"use client";

import React from 'react';
import { SkipForward } from 'lucide-react';
import { PlaylistItemData } from '../../../lib/types';
import { getArtistName } from '../../../lib/utils';

interface UpcomingQueueProps {
  queue: PlaylistItemData[];
  isQueueLocked: boolean;
}

const UpcomingQueue: React.FC<UpcomingQueueProps> = ({ queue, isQueueLocked }) => {
  if (queue.length === 0) {
    return null;
  }

  return (
    <div
      className="w-full p-8 rounded-xl relative overflow-hidden bg-[rgba(26,26,46,0.7)] backdrop-blur-[20px] border border-[rgba(0,255,255,0.2)] shadow-[0_0_40px_rgba(0,255,255,0.1)]"
    >
      <h2 className="text-2xl font-semibold mb-4 text-[#00FFFF] [text-shadow:0_0_10px_#00FFFF]">
        <SkipForward className="inline mr-2" />
        Up Next {isQueueLocked && <span className="text-sm font-normal">(Locked)</span>}
      </h2>
      <ul className="space-y-3">
        {queue.map((item, index) => (
          <li key={item._id} className="flex items-center bg-white/5 p-3 rounded-lg transition-all hover:bg-white/10">
            <span className="text-lg font-bold text-cyan-400 w-8 text-center">{index + 1}</span>
            <img src={item.song.artwork} alt="artwork" className="w-12 h-12 rounded-md mx-4" />
            <div className="flex-grow">
              <p className="font-semibold">{item.song.title}</p>
              <p className="text-sm text-gray-400">{getArtistName(item.song.artist)}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UpcomingQueue;