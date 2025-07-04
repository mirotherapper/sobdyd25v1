"use client";

import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import toast, { Toaster } from 'react-hot-toast';

export default function SubmitPage() {
  const { isSignedIn } = useUser();
  const [trackUrl, setTrackUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignedIn) {
      toast.error('You must be signed in to submit a track.');
      return;
    }
    setIsSubmitting(true);
    // Here you would add your API call logic
    // e.g., await fetch('/api/submissions', { method: 'POST', ... });
    toast.success(`Submitting track: ${trackUrl}`);
    setTimeout(() => {
      setIsSubmitting(false);
      setTrackUrl('');
    }, 1000);
  };

  return (
    <div
      className="min-h-screen text-white p-8 flex flex-col items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)' }}
    >
      <Toaster position="top-center" />
      <div className="w-full max-w-md p-8 rounded-xl bg-[rgba(26,26,46,0.7)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)]">
        <h1 className="text-3xl font-bold mb-6 text-center text-cyan-400">Submit a Track</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="trackUrl" className="block text-sm font-medium text-gray-300 mb-2">
              SoundCloud or YouTube URL
            </label>
            <input
              id="trackUrl"
              type="url"
              value={trackUrl}
              onChange={(e) => setTrackUrl(e.target.value)}
              placeholder="https://soundcloud.com/..."
              required
              className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>
          <button type="submit" disabled={isSubmitting || !isSignedIn} className="w-full py-3 px-4 bg-cyan-500 font-semibold rounded-lg hover:bg-cyan-400 disabled:bg-gray-600 transition-colors">
            {isSubmitting ? 'Submitting...' : 'Submit Track'}
          </button>
          {!isSignedIn && <p className="text-center text-sm text-yellow-500">Please sign in to enable submission.</p>}
        </form>
      </div>
    </div>
  );
}