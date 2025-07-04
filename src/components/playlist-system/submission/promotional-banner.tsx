"use client";

import React from 'react';

interface PromotionalBannerProps {
  className?: string;
}

export function PromotionalBanner({ className = '' }: PromotionalBannerProps) {
  return (
    <div className={`w-full ${className}`}>
      {/* Main Promotional Banner */}
      <div className="bg-gradient-to-r from-purple-900/40 via-cyan-900/40 to-purple-900/40 backdrop-blur-sm rounded-xl p-6 border-2 border-purple-400/80 hover:border-purple-300 mb-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white mb-2">
            🎵 Get Your Music Heard Live! 🎵
          </h3>
          <p className="text-gray-300 mb-4">
            Submit your tracks and watch them come to life in our live DJ sets
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="flex items-center text-cyan-400">
              <span className="mr-2">⚡</span>
              <span>Instant Processing</span>
            </div>
            <div className="flex items-center text-purple-400">
              <span className="mr-2">🎯</span>
              <span>Live Audience</span>
            </div>
            <div className="flex items-center text-green-400">
              <span className="mr-2">📈</span>
              <span>Real Exposure</span>
            </div>
          </div>
        </div>
      </div>



      {/* Footer Info */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          © {new Date().getFullYear()} StayOnBeat • DoYouDJ Platform • All rights reserved
        </p>
        <div className="mt-2 flex justify-center items-center space-x-4 text-xs text-gray-600">
          <span>🔒 Secure Payments</span>
          <span>•</span>
          <span>⚡ Instant Processing</span>
          <span>•</span>
          <span>🎵 Live Experience</span>
        </div>
      </div>
    </div>
  );
}
