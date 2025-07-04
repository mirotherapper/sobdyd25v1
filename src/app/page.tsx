"use client";

import Link from 'next/link';
import React from 'react';

export default function HomePage() {
  return (
    <div
      className="min-h-screen text-white p-8 flex flex-col items-center justify-center text-center"
      style={{
        background: `
          radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
          linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%) no-repeat
        `
      }}
    >
      <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-yellow-300 bg-clip-text text-transparent">
        Stay on Beat
      </h1>
      <p className="text-xl text-gray-300 mb-8 max-w-2xl">
        The interactive live radio show where your ratings decide the next track. Tune in, rate the music, and shape the sound of the show.
      </p>
      <div className="space-x-4">
        <Link href="/show" className="px-8 py-3 bg-cyan-500 text-white font-bold rounded-lg shadow-lg hover:bg-cyan-400 transition-all duration-200">
          Go to Live Show
        </Link>
      </div>
    </div>
  );
}