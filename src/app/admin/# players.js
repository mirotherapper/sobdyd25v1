"use client";

import React from "react";
import { Music, CheckCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { type MasterTrackCardData } from "@/src/05_Shared_UI_And_Utilities";
import { SubmissionsDndContext } from "@/components/playlist-system/submissions-dnd-context";
import { DraggableSubmissionCard } from "@/components/playlist-system/draggable-submission-card";
import { QueueDroppable } from "@/components/playlist-system/queue-droppable";
import { toast } from "@/components/ui/use-toast";

// --- Helper Components & Styles (kept local for clarity) ---

const ScrollZone = ({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) => (
  <div className={className} style={{ ...style, overflow: "auto" }}>
    {children}
  </div>
);

const neonTurquoiseStyle = {
  color: "#00ffff",
  textShadow: "0 0 3.5px #00ffff, 0 0 7px #00ffff, 0 0 10.5px #00ffff",
  transition: "all 0.3s ease",
};

const getPlatformIcon = (platform: string) => {
  // In a real app, you might have different icons for each platform
  return <Music className="h-4 w-4" />;
};


// --- Main Component ---

interface PlaylistColumnsProps {
  submissions: MasterTrackCardData[];
  playlist: MasterTrackCardData[];
  playedTracks: MasterTrackCardData[];
  onAddToQueue: (submission: MasterTrackCardData) => Promise<void>;
  onQueueReorder: (newItems: MasterTrackCardData[]) => Promise<void>;
  expandedItems: Record<string | number, boolean>;
  onExpand: (id: string | number) => void;
  isPlaylistLocked: boolean;
  expandAll: boolean;
  setExpandAll: (value: boolean | ((prev: boolean) => boolean)) => void;
  onRefresh: () => void;
  onCopyWednesday: () => void;
  onAutoGenerate: () => void;
  randomResetActive: boolean;
  randomResetTimer: number;
  onActivateRandomReset: () => void;
}

export function PlaylistColumns({
  submissions,
  playlist,
  playedTracks,
  onAddToQueue,
  onQueueReorder,
  expandedItems,
  onExpand,
  isPlaylistLocked,
  expandAll,
  setExpandAll,
  onRefresh,
  onCopyWednesday,
  onAutoGenerate,
  randomResetActive,
  randomResetTimer,
  onActivateRandomReset,
}: PlaylistColumnsProps) {
  return (
    <SubmissionsDndContext
      submissions={submissions}
      queue={playlist}
      onAddToQueue={onAddToQueue}
      onQueueReorder={onQueueReorder}
      expandedItems={expandedItems}
      onExpand={onExpand}
      isPlaylistLocked={isPlaylistLocked}
      neonTurquoiseStyle={neonTurquoiseStyle}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Submissions Column */}
        <div className="admin-container p-6">
          <h2
            className="text-xl font-semibold mb-4 flex items-center"
            style={{
              color: '#00FFFF',
              textShadow: '0 0 7px #00FFFF, 0 0 14px #00FFFF, 0 0 21px #00FFFF',
              fontWeight: '900',
              letterSpacing: '1px'
            }}
          >
            <Music className="h-5 w-5 mr-2 text-purple-500" />
            Submissions
            <span className="ml-2 text-xs text-purple-400 font-normal bg-purple-900/20 px-2 py-1 rounded-full border border-purple-500/30">
              Drag to Queue →
            </span>
          </h2>

          {/* Glass HUD Style Tabs */}
          <div className="flex space-x-2 mb-4">
            {/* Expand/Collapse Tab */}
            <button
              type="button"
              className="relative h-10 px-4 rounded-lg overflow-hidden group cursor-pointer"
              style={{
                background: `linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(0, 255, 255, 0.05) 25%, rgba(255, 255, 255, 0.02) 50%, rgba(0, 255, 255, 0.05) 75%, rgba(255, 255, 255, 0.1) 100%)`,
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(0, 255, 255, 0.3)',
                boxShadow: `0 0 30px rgba(0, 255, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)`
              }}
              onClick={() => setExpandAll(!expandAll)}
            >
              <div className="flex items-center justify-center h-full">
                <span className="text-xs font-bold tracking-wider" style={{ color: '#00FFFF', textShadow: '0 0 7px #00FFFF', letterSpacing: '1px', fontWeight: '900' }}>
                  {expandAll ? "CO" : "EX"}
                </span>
              </div>
            </button>

            {/* Refresh Tab */}
            <button
              type="button"
              className="relative h-10 px-4 rounded-lg overflow-hidden group cursor-pointer"
              style={{
                background: `linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(0, 255, 255, 0.05) 25%, rgba(255, 255, 255, 0.02) 50%, rgba(0, 255, 255, 0.05) 75%, rgba(255, 255, 255, 0.1) 100%)`,
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(0, 255, 255, 0.3)',
                boxShadow: `0 0 30px rgba(0, 255, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)`
              }}
              onClick={onRefresh}
            >
              <div className="flex items-center justify-center h-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#00FFFF', filter: 'drop-shadow(0 0 10px #00FFFF)' }}>
                  <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9"></path>
                </svg>
              </div>
            </button>

            {/* Today's Submissions Tab */}
            <button
              type="button"
              className="relative h-10 px-4 rounded-lg overflow-hidden group cursor-pointer"
              style={{
                background: `linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(0, 255, 0, 0.05) 25%, rgba(255, 255, 255, 0.02) 50%, rgba(0, 255, 0, 0.05) 75%, rgba(255, 255, 255, 0.1) 100%)`,
                border: '1px solid rgba(0, 255, 0, 0.2)',
                boxShadow: `0 0 30px rgba(0, 255, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)`
              }}
              onClick={onCopyWednesday}
            >
              <div className="flex items-center justify-center h-full">
                <span className="text-xs font-bold tracking-wider" style={{ color: '#00FF00', textShadow: '0 0 7px #00FF00', letterSpacing: '1px', fontWeight: '900' }}>
                  TODAY
                </span>
              </div>
            </button>

            {/* Auto Generate Tab */}
            <button
              type="button"
              className="relative h-10 px-4 rounded-lg overflow-hidden group cursor-pointer"
              style={{
                background: `linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(0, 255, 255, 0.05) 25%, rgba(255, 255, 255, 0.02) 50%, rgba(0, 255, 255, 0.05) 75%, rgba(255, 255, 255, 0.1) 100%)`,
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(0, 255, 255, 0.3)',
                boxShadow: `0 0 30px rgba(0, 255, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)`
              }}
              onClick={onAutoGenerate}
            >
              <div className="flex items-center justify-center h-full">
                <span className="text-xs font-bold tracking-wider" style={{ color: '#00FFFF', textShadow: '0 0 7px #00FFFF', letterSpacing: '1px', fontWeight: '900' }}>
                  AG
                </span>
              </div>
            </button>

            {/* Random Reset Tab */}
            <button
              type="button"
              className="relative h-10 px-4 rounded-lg overflow-hidden group cursor-pointer"
              style={{
                background: randomResetActive ? `linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(128, 128, 128, 0.1) 50%, rgba(255, 255, 255, 0.05) 100%)` : `linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(0, 255, 255, 0.05) 25%, rgba(255, 255, 255, 0.02) 50%, rgba(0, 255, 255, 0.05) 75%, rgba(255, 255, 255, 0.1) 100%)`,
                backdropFilter: 'blur(20px)',
                border: randomResetActive ? '1px solid rgba(128, 128, 128, 0.3)' : '1px solid rgba(0, 255, 255, 0.3)',
                boxShadow: randomResetActive ? `0 0 30px rgba(128, 128, 128, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)` : `0 0 30px rgba(0, 255, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)`,
                opacity: randomResetActive ? 0.6 : 1,
                cursor: randomResetActive ? 'not-allowed' : 'pointer'
              }}
              disabled={randomResetActive}
              onClick={onActivateRandomReset}
            >
              <div className="flex items-center justify-center h-full">
                <span className="text-xs font-bold tracking-wider" style={{ color: randomResetActive ? '#888888' : '#00FFFF', textShadow: randomResetActive ? 'none' : '0 0 7px #00FFFF', letterSpacing: '1px', fontWeight: '900' }}>
                  {randomResetActive ? `${Math.floor(randomResetTimer / 60)}:${(randomResetTimer % 60).toString().padStart(2, '0')}` : "RR"}
                </span>
              </div>
            </button>
          </div>

          <ScrollZone className="max-h-[400px] pr-2 custom-scrollbar">
            {submissions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-purple-400">No submissions yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {submissions.map((submission) => (
                  <DraggableSubmissionCard
                    key={submission.id}
                    item={submission}
                    neonTurquoiseStyle={neonTurquoiseStyle}
                  />
                ))}
              </div>
            )}
          </ScrollZone>
        </div>

        {/* Queue Column */}
        <div className="admin-container p-6">
          <h2
            className="text-xl font-semibold mb-4 flex items-center"
            style={{
              color: '#00FFFF',
              textShadow: '0 0 7px #00FFFF, 0 0 14px #00FFFF, 0 0 21px #00FFFF',
              fontWeight: '900',
              letterSpacing: '1px'
            }}
          >
            <Music className="h-5 w-5 mr-2 text-purple-500" />
            Queue
          </h2>
          <ScrollZone className="max-h-[400px] pr-2 custom-scrollbar">
            <QueueDroppable
              items={playlist}
              onReorder={onQueueReorder}
              expandedItems={expandedItems}
              onExpand={onExpand}
              isUnlockMode={!isPlaylistLocked}
              emptyMessage="Queue is empty"
            />
          </ScrollZone>
        </div>

        {/* Played Tracks Column */}
        <div className="admin-container p-6">
          <h2
            className="text-xl font-semibold mb-4 flex items-center"
            style={{
              color: '#00FFFF',
              textShadow: '0 0 7px #00FFFF, 0 0 14px #00FFFF, 0 0 21px #00FFFF',
              fontWeight: '900',
              letterSpacing: '1px'
            }}
          >
            <Music className="h-5 w-5 mr-2 text-purple-500" />
            Played Tracks
          </h2>
          <ScrollZone className="max-h-[400px] pr-2 custom-scrollbar">
            {playedTracks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-purple-400">No tracks played yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {playedTracks.map((track) => (
                  <div key={track.id} className="admin-card relative">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <span className="font-mono text-sm w-6 text-gray-500">
                          {track.position?.toString().padStart(2, "0")}
                        </span>
                        <div className="ml-2">
                          <div className="flex items-center">
                            <div className="mr-2 text-gray-400">
                              {track.platform ? getPlatformIcon(track.platform) : <Music className="h-4 w-4" />}
                            </div>
                            <p className="font-medium line-clamp-1">
                              {track.songTitle}
                            </p>
                          </div>
                          <span className="text-sm" style={neonTurquoiseStyle}>
                            {track.artistName}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <Badge variant="default">{track.submissionType}</Badge>
                        {track.submissionTime && (
                          <span className="text-xs text-gray-500 mt-1">
                            {track.submissionTime}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollZone>
        </div>
      </div>
    </SubmissionsDndContext>
  );
}
