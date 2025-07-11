'use client';

import React from 'react';
import Image from 'next/image';
import { SkipForward } from 'lucide-react';
import { PlaylistItemData } from '../../lib/types';

interface UpcomingQueueProps {
  queue: PlaylistItemData[];
  isQueueLocked: boolean;
}

const UpcomingQueue: React.FC<UpcomingQueueProps> = ({
  queue,
  isQueueLocked,
}) => {
  if (queue.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-[rgba(0,255,255,0.2)] bg-[rgba(26,26,46,0.7)] p-8 shadow-[0_0_40px_rgba(0,255,255,0.1)] backdrop-blur-[20px]">
      <h2 className="mb-4 text-2xl font-semibold text-[#00FFFF] [text-shadow:0_0_10px_#00FFFF]">
        <SkipForward className="mr-2 inline" />
        Up Next{' '}
        {isQueueLocked && <span className="text-sm font-normal">(Locked)</span>}
      </h2>
      <ul className="space-y-3">
        {queue.map((item, index) => (
          <li
            key={item._id}
            className="flex items-center rounded-lg bg-white/5 p-3 transition-all hover:bg-white/10"
          >
            <span className="w-8 text-center text-lg font-bold text-cyan-400">
              {index + 1}
            </span>
            <Image
              src={item.metadata?.artwork || '/default-album-art.jpg'}
              alt="artwork"
              width={48}
              height={48}
              className="mx-4 h-12 w-12 rounded-md"
            />
            <div className="flex-grow">
              <p className="font-semibold">
                {item.metadata?.title || 'Unknown Track'}
              </p>
              <p className="text-sm text-gray-400">
                {item.metadata?.artist || 'Unknown Artist'}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UpcomingQueue;
