import React from 'react';

export const PromotionalBanner = () => {
  return (
    <div className="overflow-hidden rounded-xl border-2 border-purple-500/80 bg-gradient-to-br from-purple-500/40 via-cyan-500/40 to-purple-500/40 p-6 shadow-[0_0_20px_rgba(147,51,234,0.3),inset_0_0_20px_rgba(255,255,255,0.1)] backdrop-blur-sm">
      <div className="text-center">
        <h3 className="mb-2 p-4 text-2xl font-bold text-white">
          🎵 Get Your Music Heard Live! 🎵
        </h3>
        <p className="mb-4 text-gray-300">
          Submit your trax and watch them come to life in our live DJ sets
        </p>
        <div className="flex justify-center space-x-6 text-sm text-cyan-300">
          <span> Instant Processing</span>
          <span> Live Audience</span>
          <span> Real Exposure</span>
        </div>
      </div>
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          © {new Date().getFullYear()} StayOnBeat • DoYouDJ Platform • All
          rights reserved
        </p>
        <div className="mt-2 flex items-center justify-center space-x-4 text-xs text-gray-600">
          <span>Powered by DoYouDJ</span>
        </div>
      </div>
    </div>
  );
};
