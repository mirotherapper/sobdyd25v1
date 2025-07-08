"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import toast, { Toaster } from 'react-hot-toast';
import { AdminHUD } from './AdminHUD';
import {
  Settings,
  Zap,
  Activity,
  Volume2,
  Power,
  SlidersHorizontal,
  Cpu,
  Monitor,
  Play,
  List,
  Inbox,
} from 'lucide-react';
import { HudButton } from './HudButton';
import { PlaylistData, PlaylistItemData } from '../../../lib/types';
import NowPlayingCard from './NowPlayingCard';
import UpcomingQueue from './UpcomingQueue';
import { SubmissionsPanel } from './SubmissionsPanel';

// Content for the "Power" panel
const PowerControls = () => (
  <div className="p-6 h-full">
    <h2 className="text-2xl font-bold mb-6 text-cyan-400 [text-shadow:0_0_15px_#00FFFF]">
      <Zap className="inline mr-3" size={28} />
      POWER CONTROLS
    </h2>
    <div className="space-y-4">
      <HudButton icon={<Activity size={20} />} variant="cyan">
        System Status
      </HudButton>
      <HudButton icon={<Volume2 size={20} />} variant="magenta">
        Audio Controls
      </HudButton>
      <HudButton icon={<Power size={20} />} variant="yellow">
        Power Management
      </HudButton>
    </div>
  </div>
);

// Content for the "Submissions" panel
const SubmissionsControls = ({ isVisible }: { isVisible: boolean }) => (
  <SubmissionsPanel isVisible={isVisible} />
);

export default function AdminPage() {
  const [isLeftHudOpen, setIsLeftHudOpen] = useState(false);
  const [isRightHudOpen, setIsRightHudOpen] = useState(false);
  
  // Player state
  const [nowPlaying, setNowPlaying] = useState<PlaylistItemData | null>(null);
  const [queue, setQueue] = useState<PlaylistItemData[]>([]);
  const [isQueueLocked, setIsQueueLocked] = useState<boolean>(false);
  const [userRating, setUserRating] = useState<number>(50);
  const [isSavingRating, setIsSavingRating] = useState(false);
  const ratingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { user, isSignedIn } = useUser();

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/playlist/live');
      if (res.ok) {
        const playlist: PlaylistData = await res.json();
        const items = playlist.items || [];
        const nowPlayingItem = items.find((item: PlaylistItemData) => item.status === 'now_playing') || null;
        const queuedItems = items
          .filter((item: PlaylistItemData) => item.status === 'queued')
          .sort((a: PlaylistItemData, b: PlaylistItemData) => a.position - b.position);

        setNowPlaying(nowPlayingItem);
        setQueue(queuedItems);
        setIsQueueLocked(playlist.is_locked || false);
      } else {
        setNowPlaying(null);
        setQueue([]);
      }
    } catch (error) {
      console.error('Error fetching live data:', error);
      setNowPlaying(null);
      setQueue([]);
    }
  }, []);

  useEffect(() => {
    const poll = async () => {
      await fetchData();
      pollingTimeoutRef.current = setTimeout(poll, 5000);
    };

    const stopPolling = () => {
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
        pollingTimeoutRef.current = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        stopPolling();
      } else {
        stopPolling();
        poll();
      }
    };

    if (document.visibilityState !== 'hidden') {
      poll();
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchData]);

  useEffect(() => {
    if (nowPlaying && isSignedIn && user) {
      const previousRating = nowPlaying.guestRatings?.find((r: { userId: string; rating: number }) => r.userId === user.id);
      setUserRating(previousRating?.rating ?? 50);
    } else {
      setUserRating(50);
    }
  }, [nowPlaying, isSignedIn, user]);

  const handleRatingChange = (newRating: number) => {
    if (!isSignedIn) {
      toast.error("Please sign in to rate a track!");
      return;
    }
    setUserRating(newRating);
    setIsSavingRating(true);

    if (ratingTimeoutRef.current) {
      clearTimeout(ratingTimeoutRef.current);
    }

    ratingTimeoutRef.current = setTimeout(async () => {
      if (!nowPlaying) return;
      try {
        const response = await fetch('/api/playlist/guest-rate-track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playlistItemId: nowPlaying._id, rating: newRating }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          toast.error(`Failed to save rating: ${errorData.message}`);
        } else {
          toast.success("Your rating has been submitted!");
        }
      } catch (error) {
        toast.error('Error saving rating.');
      } finally {
        setIsSavingRating(false);
      }
    }, 500);
  };

  const upcomingQueue = isQueueLocked ? queue.slice(0, 10) : queue.slice(0, 5);

  return (
    <div
      className="relative min-h-screen text-white"
      style={{
        background: `
          radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
          linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%) no-repeat
        `,
        backgroundImage: `
          linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '30px 30px',
      }}
    >
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#1a1a2e',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          },
        }}
      />
      
      {/* Main Content Area */}
      <div className="flex flex-col items-center justify-start pt-16 p-8">
        <div className="w-full max-w-2xl">
          <NowPlayingCard
            nowPlaying={nowPlaying}
            userRating={userRating}
            isSavingRating={isSavingRating}
            isSignedIn={!!isSignedIn}
            onRatingChange={handleRatingChange}
          />
          <UpcomingQueue queue={upcomingQueue} isQueueLocked={isQueueLocked} />
        </div>
      </div>

      {/* Left HUD for Power Controls */}
      <AdminHUD
        side="left"
        label="POWER"
        icon={<Zap size={24} style={{ color: '#00FFFF', filter: 'drop-shadow(0 0 8px #00FFFF)' }} />}
        isOpen={isLeftHudOpen}
        onToggle={() => setIsLeftHudOpen(!isLeftHudOpen)}
        iconAnimation="pulse"
      >
        <PowerControls />
      </AdminHUD>

      {/* Right HUD for Submissions */}
      <AdminHUD
        side="right"
        label="SUBMISSIONS"
        icon={<Inbox size={24} style={{ color: '#00FFFF', filter: 'drop-shadow(0 0 8px #00FFFF)' }} />}
        isOpen={isRightHudOpen}
        onToggle={() => setIsRightHudOpen(!isRightHudOpen)}
        iconAnimation="pulse"
      >
        <SubmissionsControls isVisible={isRightHudOpen} />
      </AdminHUD>
    </div>
  );
}
