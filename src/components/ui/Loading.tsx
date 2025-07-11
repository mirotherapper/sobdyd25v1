'use client';

import React from 'react';
import { RotateCw, Music } from 'lucide-react';

interface LoadingProps {
  message?: string;
  isFullScreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({
  message = 'Loading...',
  isFullScreen = true,
}) => {
  return (
    <div
      className={`loading-container ${
        isFullScreen ? 'fixed inset-0 z-50' : 'relative'
      } bg-opacity-95 flex flex-col items-center justify-center bg-black text-white`}
    >
      <div className="loading-content flex flex-col items-center">
        <div className="loading-icon-container mb-6">
          <div className="loading-icon-outer relative">
            <RotateCw className="loading-spinner text-primary-500 h-16 w-16 animate-spin" />
            <div className="loading-icon-inner absolute inset-0 flex items-center justify-center">
              <Music className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        <h2 className="loading-title mb-2 text-2xl font-bold">DoYouDj</h2>
        <p className="loading-message text-lg text-gray-300">{message}</p>

        <div className="loading-bar mt-8 h-1 w-64 overflow-hidden rounded-full bg-gray-700">
          <div className="loading-progress bg-primary-500 h-full animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default Loading;
