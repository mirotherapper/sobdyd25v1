"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import toast, { Toaster } from 'react-hot-toast';
import { Play, SkipForward, Lock, Unlock } from 'lucide-react';
import { getArtistName } from '../../../lib/utils';

import { SubmissionData, PlaylistItemData } from '../../../lib/types';
import { HUDLeftTab } from './hudleft';
import { HUDRightTab } from './righthud';
import TrackCard from './TrackCard';
import { adminReducer, initialState } from './reducer';
import { SkeletonCard } from './SkeletonCard';

export default function AdminPage() {
  const [state, dispatch] = React.useReducer(adminReducer, initialState);
  const {
    submissions, queue, played, nowPlaying, isPlayingNext, currentRating,
    isSavingRating, isQueueLocked, leftHudOpen, rightHudOpen, isLoading
  } = state;

  // GSAP refs
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const playersRef = useRef<HTMLDivElement>(null);
  const columnsRef = useRef<HTMLDivElement>(null);

  // Drop zone refs for GSAP Draggable
  const submissionsDropRef = useRef<HTMLDivElement>(null);
  const queueDropRef = useRef<HTMLDivElement>(null);
  const playedDropRef = useRef<HTMLDivElement>(null);
  const ratingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // GSAP animations setup
  const { contextSafe } = useGSAP({ scope: containerRef });

  // HUD toggle functions
  const toggleLeftHud = () => {
    dispatch({ type: 'TOGGLE_LEFT_HUD' });
  };

  const toggleRightHud = () => {
    dispatch({ type: 'TOGGLE_RIGHT_HUD' });
  };

  // Initial page load animations
  useGSAP(() => {
    const tl = gsap.timeline();

    if (titleRef.current) {
      tl.fromTo(titleRef.current,
        {
          opacity: 0,
          y: -50,
          scale: 0.8
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          ease: "power3.out"
        }
      );
    }

    if (playersRef.current) {
      tl.fromTo(Array.from(playersRef.current.children),
        {
          opacity: 0,
          y: 30,
          rotationX: -15
        },
        {
          opacity: 1,
          y: 0,
          rotationX: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: "power2.out"
        }, "-=0.5"
      );
    }

    if (columnsRef.current) {
      tl.fromTo(Array.from(columnsRef.current.children),
        {
          opacity: 0,
          y: 50,
          scale: 0.9
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: "power2.out"
        }, "-=0.3"
      );
    }
  }, { scope: containerRef });

  const fetchData = useCallback(async () => {
    try {
      let submissionsData: SubmissionData[] = [];
      let playlistData: {
        queue: PlaylistItemData[];
        played: PlaylistItemData[];
        nowPlaying: PlaylistItemData | null;
        isQueueLocked: boolean;
      } = {
        queue: [],
        played: [],
        nowPlaying: null,
        isQueueLocked: false,
      };
      // Fetch submissions
      const submissionsRes = await fetch('/api/submissions');
      if (submissionsRes.ok) {
        const data = await submissionsRes.json();
        submissionsData = data.filter((sub: SubmissionData) => sub.status === 'pending');
      }

      // Fetch playlists (assuming one main live playlist)
      const playlistsRes = await fetch('/api/playlist-management');
      if (playlistsRes.ok) {
        const data = await playlistsRes.json();
        const livePlaylist = data.find((p: any) => !p.is_show_archive);
        if (livePlaylist) {
          const queuedItems = livePlaylist.items.filter((item: PlaylistItemData) => item.status === 'queued').sort((a: PlaylistItemData, b: PlaylistItemData) => a.position - b.position);
          const playedItems = livePlaylist.items.filter((item: PlaylistItemData) => item.status === 'played').sort((a: PlaylistItemData, b: PlaylistItemData) => a.position - b.position);
          const nowPlayingItem = livePlaylist.items.find((item: PlaylistItemData) => item.status === 'now_playing');

          playlistData = {
            queue: queuedItems,
            played: playedItems,
            nowPlaying: nowPlayingItem || null,
            isQueueLocked: livePlaylist.is_locked || false,
          };
        }
      }
      dispatch({ type: 'FETCH_SUCCESS', payload: { submissions: submissionsData, ...playlistData } });
    } catch (error) {
      console.error('Error fetching data:', error);
      dispatch({ type: 'FETCH_ERROR' });
    }
  }, []);

  useEffect(() => {
    const poll = async () => {
      await fetchData();
      // Schedule the next poll after the current one completes
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
        stopPolling(); // Ensure no multiple pollers are running
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

  // Sync the slider with the currently playing track's rating
  useEffect(() => {
    if (nowPlaying) {
      dispatch({ type: 'RATING_CHANGE', payload: nowPlaying.rating ?? 50 });
    }
  }, [nowPlaying]);

  // GSAP Draggable handlers
  const handleTrackDrop = contextSafe(async (draggedElement: HTMLElement, targetZone: string) => {
    const trackId = draggedElement.dataset.trackId;
    const sourceZone = draggedElement.dataset.sourceZone;
    const sourceIndex = parseInt(draggedElement.dataset.sourceIndex || '0', 10);
    const destinationIndex = calculateDropIndex(draggedElement, targetZone);

    if (!trackId || !sourceZone) {
      return; // Not enough data to perform a move
    }

    // If dropped in the same place, do nothing. This allows for reordering.
    if (sourceZone === targetZone && sourceIndex === destinationIndex) {
      return;
    }

    // --- Optimistic Update ---

    // 1. Store the original state for a potential rollback on API failure.
    const originalState = { submissions, queue, played };

    // 2. Create new state arrays by performing the move locally.
    const tempState = {
      submissions: [...submissions],
      queue: [...queue],
      played: [...played],
    };

    const getList = (zone: string) => {
      if (zone === 'submissions') return tempState.submissions;
      if (zone === 'queue') return tempState.queue;
      return tempState.played;
    };

    const sourceList = getList(sourceZone);
    const [movedItem] = sourceList.splice(sourceIndex, 1);

    if (!movedItem) {
      console.error("Optimistic update failed: could not find the moved item.");
      return;
    }

    const destinationList = getList(targetZone);
    destinationList.splice(destinationIndex, 0, movedItem);

    // 3. Update the UI immediately with the new state.
    dispatch({ type: 'DND_UPDATE', payload: tempState });

    // 4. Make the API call in the background.
    try {
      const response = await fetch('/api/track-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draggableId: trackId,
          source: { droppableId: sourceZone, index: sourceIndex },
          destination: { droppableId: targetZone, index: destinationIndex },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'API request failed');
      }
      // On success, the UI is already correct. The polling will eventually sync any
      // subtle backend changes (like new IDs).
    } catch (error) {
      console.error('Error during drag and drop, reverting UI:', error);
      // 5. On failure, revert the UI to its original state.
      dispatch({ type: 'DND_UPDATE', payload: originalState });
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast.error(`Failed to move track: ${errorMessage}`);
    }
  });

  const handleToggleLock = contextSafe(async () => {
    try {
      const response = await fetch('/api/playlist/toggle-lock', { method: 'POST' });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to toggle lock state.');
      }

      toast.success(data.message);
      // Update state immediately for a responsive UI
      dispatch({ type: 'TOGGLE_LOCK_SUCCESS', payload: data.is_locked });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast.error(`Error: ${errorMessage}`);
    }
  });

  const calculateDropIndex = (draggedElement: HTMLElement, targetZone: string): number => {
    const targetContainer = getTargetContainer(targetZone);
    if (!targetContainer) return 0;

    const trackCards = Array.from(targetContainer.querySelectorAll('[data-track-id]'));
    const draggedRect = draggedElement.getBoundingClientRect();

    for (let i = 0; i < trackCards.length; i++) {
      const cardRect = trackCards[i].getBoundingClientRect();
      if (draggedRect.top < cardRect.top + cardRect.height / 2) {
        return i;
      }
    }

    return trackCards.length;
  };

  const getTargetContainer = (zone: string): HTMLElement | null => {
    switch (zone) {
      case 'submissions': return submissionsDropRef.current;
      case 'queue': return queueDropRef.current;
      case 'played': return playedDropRef.current;
      default: return null;
    }
  };

  const handlePlayNext = contextSafe(async () => {
    if (queue.length === 0) {
      toast.error("Queue is empty. Add a track to play next.");
      return;
    }
    dispatch({ type: 'PLAY_NEXT_START' });
    try {
      const response = await fetch('/api/playlist/play-next', { method: 'POST' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to play next track');
      }
      await fetchData(); // Refresh data to show the new state
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast.error(`Error: ${errorMessage}`);
    } finally {
      dispatch({ type: 'PLAY_NEXT_FINISH' });
    }
  });

  const handleRatingChange = (newRating: number) => {
    dispatch({ type: 'RATING_CHANGE', payload: newRating });
    dispatch({ type: 'RATING_SAVE_START' });

    // Debounce the API call to avoid spamming the server while sliding
    if (ratingTimeoutRef.current) {
      clearTimeout(ratingTimeoutRef.current);
    }

    ratingTimeoutRef.current = setTimeout(async () => {
      if (!nowPlaying) return;
      try {
        const response = await fetch('/api/playlist/rate-track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playlistItemId: nowPlaying._id, rating: newRating }),
        });
        if (!response.ok) {
          toast.error('Failed to save rating.');
        }
        // The "Saving..." text will disappear on its own
      } catch (error) {
        toast.error('Error saving rating.');
      } finally {
        dispatch({ type: 'RATING_SAVE_FINISH' });
      }
    }, 500); // Wait 500ms after the user stops sliding to save
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen text-white p-8 relative overflow-hidden bg-[#1a1a2e] [background:radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.3)_0%,transparent_50%),radial-gradient(circle_at_80%_20%,rgba(255,119,198,0.3)_0%,transparent_50%),radial-gradient(circle_at_40%_40%,rgba(120,219,255,0.2)_0%,transparent_50%),linear-gradient(135deg,#0f0f23_0%,#1a1a2e_50%,#16213e_100%)]"
    >
      {/* Toaster component for displaying notifications */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 5000,
          style: {
            background: '#1a1a2e',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          },
        }} />
      {/* HUD Components */}
      <HUDLeftTab isOpen={leftHudOpen} onToggle={toggleLeftHud} />
      <HUDRightTab isOpen={rightHudOpen} onToggle={toggleRightHud} />

      {/* Main Content */}
      <div className="relative z-10">
        <h1
          ref={titleRef}
          className="text-5xl font-bold mb-8 text-center bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-yellow-300 bg-clip-text text-transparent [text-shadow:0_0_30px_rgba(0,255,255,0.5)] [filter:drop-shadow(0_0_10px_rgba(0,255,255,0.3))]"
        >
          ADMIN DASHBOARD
        </h1>

        {/* Dynamic Media Players */}
        <div ref={playersRef} className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Next In Queue Player */}
          <div
            className="p-6 rounded-xl shadow-2xl flex flex-col items-center justify-center h-64 relative overflow-hidden backdrop-blur-[20px] border border-[rgba(0,255,255,0.3)] shadow-[0_0_30px_rgba(0,255,255,0.2)] [background:linear-gradient(135deg,rgba(0,255,255,0.1)_0%,rgba(255,255,255,0.05)_25%,rgba(0,255,255,0.02
          >
            <h2 className="text-2xl font-semibold mb-4" style={{ color: '#00FFFF', textShadow: '0 0 10px #00FFFF' }}>
              <SkipForward className="inline mr-2" />
              Next In Queue
            </h2>
            {queue[0] ? (
              <div className="text-center">
                <img src={queue[0].song.artwork} alt="Artwork" className="w-24 h-24 rounded-xl mb-3 shadow-lg" />
                <p className="text-xl font-bold">{queue[0].song.title}</p>
                <p className="text-md text-gray-300">
                  {getArtistName(queue[0].song.artist)}
                </p>
                <button
                  onClick={handlePlayNext}
                  disabled={isPlayingNext || queue.length === 0}
                  className="mt-4 px-4 py-2 bg-cyan-500 text-white font-bold rounded-lg shadow-lg hover:bg-cyan-400 transition-all duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center"
                  style={{ textShadow: '0 0 5px rgba(0,0,0,0.5)' }}
                >
                  {isPlayingNext ? (
                    <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Play className="mr-2 h-5 w-5" /> Play Next
                    </>
                  )}
                </button>
              </div>
            ) : (
              <p className="text-gray-400">No track in queue</p>
            )}
          </div>

          {/* Now Playing Player */}
          <div
            className="p-6 rounded-xl shadow-2xl flex flex-col items-center justify-center h-64 relative overflow-hidden"
            style={{
              background: `
                linear-gradient(135deg,
                  rgba(255, 0, 255, 0.1) 0%,
                  rgba(255, 255, 255, 0.05) 25%,
                  rgba(255, 0, 255, 0.02) 50%,
                  rgba(255, 255, 255, 0.05) 75%,
                  rgba(255, 0, 255, 0.1) 100%
                )
              `,
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 0, 255, 0.3)',
              boxShadow: '0 0 30px rgba(255, 0, 255, 0.2)'
            }}
          >
            <h2 className="text-2xl font-semibold mb-4" style={{ color: '#FF00FF', textShadow: '0 0 10px #FF00FF' }}>
              <Play className="inline mr-2" />
              Now Playing
            </h2>
            {nowPlaying ? (
              <div className="text-center">
                <img src={nowPlaying.song.artwork} alt="Artwork" className="w-24 h-24 rounded-xl mb-3 shadow-lg" />
                <p className="text-xl font-bold">{nowPlaying.song.title}</p>
                <p className="text-md text-gray-300">
                  {getArtistName(nowPlaying.song.artist)}
                </p>
                <div className="w-full mt-4">
                  <label htmlFor="rating" className="block text-sm font-medium text-gray-400 mb-1">
                    Host Rating: {currentRating}
                  </label>
                  <input
                    id="rating"
                    type="range"
                    min="0"
                    max="100"
                    value={currentRating}
                    onChange={(e) => handleRatingChange(parseInt(e.target.value, 10))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  {isSavingRating && <p className="text-xs text-cyan-400 mt-1 animate-pulse">Saving...</p>}
                </div>
              </div>
            ) : (
              <p className="text-gray-400">No track playing</p>
            )}
          </div>
        </div>

        {/* 3-Column Playlist Management */}
        <div ref={columnsRef} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Submissions Column */}
          <div
            ref={submissionsDropRef}
            data-drop-zone="submissions"
            className="drop-zone p-6 rounded-xl shadow-2xl min-h-[500px] relative overflow-hidden transition-all duration-300 hover:shadow-3xl"
            style={{
              background: `
                linear-gradient(135deg,
                  rgba(255, 255, 0, 0.1) 0%,
                  rgba(255, 255, 255, 0.05) 25%,
                  rgba(255, 255, 0, 0.02) 50%,
                  rgba(255, 255, 255, 0.05) 75%,
                  rgba(255, 255, 0, 0.1) 100%
                )
              `,
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 0, 0.3)',
              boxShadow: '0 0 30px rgba(255, 255, 0, 0.2)'
            }}
          >
            <h2 className="text-2xl font-semibold mb-4" style={{ color: '#FFFF00', textShadow: '0 0 10px #FFFF00' }}>
              Submissions
            </h2>
            <div className="space-y-2 track-container">
                />
              ))}
            </div>
          </div>

          {/* Queue Column */}
          <div
            ref={queueDropRef}
            data-drop-zone="queue"
            className="drop-zone p-6 rounded-xl shadow-2xl min-h-[500px] relative overflow-hidden transition-all duration-300 hover:shadow-3xl"
            style={{
              background: `
                linear-gradient(135deg,
                  rgba(0, 255, 255, 0.1) 0%,
                  rgba(255, 255, 255, 0.05) 25%,
                  rgba(0, 255, 255, 0.02) 50%,
                  rgba(255, 255, 255, 0.05) 75%,
                  rgba(0, 255, 255, 0.1) 100%
                )
              `,
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0, 255, 255, 0.3)',
              boxShadow: '0 0 30px rgba(0, 255, 255, 0.2)'
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold" style={{ color: '#00FFFF', textShadow: '0 0 10px #00FFFF' }}>
                Queue
              </h2>
              <button
                onClick={handleToggleLock}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all"
                title={isQueueLocked ? 'Unlock Queue' : 'Lock Top 10'}
              >
                {isQueueLocked ? <Lock className="h-5 w-5 text-cyan-300" /> : <Unlock className="h-5 w-5 text-gray-400" />}
              </button>
            </div>
            <div className="space-y-2 track-container">
              {queue.map((item, index) => (
                <TrackCard
                  key={item._id}
                  item={item}
                  index={index}
                  sourceZone="queue"
                  onDrop={handleTrackDrop}
                />
              ))}
            </div>
          </div>

          {/* Played Column */}
          <div
            ref={playedDropRef}
            data-drop-zone="played"
            className="drop-zone p-6 rounded-xl shadow-2xl min-h-[500px] relative overflow-hidden transition-all duration-300 hover:shadow-3xl"
            style={{
              background: `
                linear-gradient(135deg,
                  rgba(255, 0, 255, 0.1) 0%,
                  rgba(255, 255, 255, 0.05) 25%,
                  rgba(255, 0, 255, 0.02) 50%,
                  rgba(255, 255, 255, 0.05) 75%,
                  rgba(255, 0, 255, 0.1) 100%
                )
              `,
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 0, 255, 0.3)',
              boxShadow: '0 0 30px rgba(255, 0, 255, 0.2)'
            }}
          >
            <h2 className="text-2xl font-semibold mb-4" style={{ color: '#FF00FF', textShadow: '0 0 10px #FF00FF' }}>
              Played
            </h2>
            <div className="space-y-2 track-container">
              {played.map((item, index) => (
                <TrackCard
                  key={item._id}
                  item={item}
                  index={index}
                  sourceZone="played"
                  onDrop={handleTrackDrop}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
