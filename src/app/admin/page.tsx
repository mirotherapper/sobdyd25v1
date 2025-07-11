'use client';

import React, { useState } from 'react';
import {
  Music,
  Settings,
  Users,
  ListMusic,
  FileText,
  RefreshCw,
  Download,
  AlertCircle,
} from 'lucide-react';
import { AdminHudLeft } from '@/components/admin/AdminHudLeft';
import { AdminHudRight } from '@/components/admin/AdminHudRight';
import NowPlayingCard from '@/components/admin/NowPlayingCard';
import { useAnalytics } from '@/lib/hooks/useAnalytics';
import SubmissionAnalyticsCard from '@/components/admin/analytics/SubmissionAnalyticsCard';
import RevenueAnalyticsCard from '@/components/admin/analytics/RevenueAnalyticsCard';
import UpcomingQueue from '@/components/admin/UpcomingQueue';
import { SubmissionsPanel } from '@/components/admin/SubmissionsPanel';
import Player from '@/components/admin/Player/Player';
import QueueList from '@/components/admin/Player/QueueList';

export const dynamic = 'force-dynamic';

export default function AdminPage() {
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);

  const {
    submissionAnalytics,
    queueMetrics,
    userEngagement,
    revenue,
    isLoading,
    error,
    lastUpdated,
    refreshAnalytics,
    exportReport,
  } = useAnalytics();

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/50 to-black p-8 text-white">
      {/* Background Grid */}
      <div
        className="fixed inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-white">
            StayOnBeat Admin
          </h1>
          <p className="text-lg text-cyan-200/80">
            Music Streaming Platform Control Center
          </p>

          {/* Analytics Status and Controls */}
          <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
            {/* Status Indicator */}
            <div className="flex items-center gap-2">
              {isLoading ? (
                <>
                  <RefreshCw
                    className="animate-spin text-yellow-400"
                    size={16}
                  />
                  <span className="text-sm text-yellow-400">
                    Loading analytics...
                  </span>
                </>
              ) : error ? (
                <>
                  <AlertCircle className="text-red-400" size={16} />
                  <span className="text-sm text-red-400">
                    Error loading data
                  </span>
                </>
              ) : (
                <>
                  <div className="h-2 w-2 rounded-full bg-green-400"></div>
                  <span className="text-sm text-green-400">Live data</span>
                  {lastUpdated && (
                    <span className="text-xs text-gray-400">
                      (Updated: {lastUpdated.toLocaleTimeString()})
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Control Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={refreshAnalytics}
                disabled={isLoading}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1 text-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-600"
              >
                <RefreshCw
                  className={isLoading ? 'animate-spin' : ''}
                  size={14}
                />
                Refresh
              </button>

              <button
                onClick={() => exportReport('full', 'csv')}
                disabled={isLoading}
                className="flex items-center gap-2 rounded-lg bg-green-600 px-3 py-1 text-sm transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-600"
              >
                <Download size={14} />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Now Playing Card */}
          <div className="col-span-full lg:col-span-2">
            <NowPlayingCard
              nowPlaying={null}
              userRating={0}
              isSavingRating={false}
              isSignedIn={false}
              onRatingChange={() => {}}
            />
          </div>

          {/* Revenue Analytics */}
          <div className="col-span-full">
            <RevenueAnalyticsCard
              revenue={revenue}
              isLoading={isLoading}
              onExportReport={exportReport}
            />
          </div>

          {/* Submission Analytics */}
          <div className="col-span-full">
            <SubmissionAnalyticsCard
              analytics={submissionAnalytics}
              isLoading={isLoading}
            />
          </div>

          {/* Quick Stats */}
          <div className="rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-2xl">
            <div className="mb-4 flex items-center gap-4">
              <Users className="text-purple-400" size={24} />
              <h2 className="text-xl font-semibold">Stats</h2>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-300">Active Users</span>
                <span className="font-semibold text-white">
                  {userEngagement.activeUsers}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Queue Length</span>
                <span className="font-semibold text-white">
                  {queueMetrics.currentQueueLength}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Total Submissions</span>
                <span className="font-semibold text-white">
                  {submissionAnalytics.totalSubmissions}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Total Revenue</span>
                <span className="font-semibold text-white">
                  ${revenue.totalRevenue.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Queue Management */}
          <div className="rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-2xl">
            <div className="mb-4 flex items-center gap-4">
              <Music className="text-green-400" size={24} />
              <h2 className="text-xl font-semibold">Queue</h2>
            </div>
            <div className="py-4 text-center">
              <p className="text-gray-400">No trax in queue</p>
              <button className="mt-4 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 px-4 py-2 text-white transition-all duration-300 hover:from-cyan-400 hover:to-purple-400">
                Refresh Queue
              </button>
            </div>
          </div>

          {/* Controls */}
          <div className="rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-2xl">
            <div className="mb-4 flex items-center gap-4">
              <Settings className="text-yellow-400" size={24} />
              <h2 className="text-xl font-semibold">Controls</h2>
            </div>
            <div className="space-y-3">
              <button className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-left transition-all duration-300 hover:border-cyan-400/50 hover:bg-white/20">
                Manage Submissions
              </button>
              <button className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-left transition-all duration-300 hover:border-purple-400/50 hover:bg-white/20">
                TraxPlaya Settings
              </button>
              <button className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-left transition-all duration-300 hover:border-green-400/50 hover:bg-white/20">
                View Analytics
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="col-span-full rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-2xl">
            <h2 className="mb-4 text-xl font-semibold">Recent Activity</h2>
            <div className="py-8 text-center">
              <p className="text-gray-400">No recent activity</p>
              <p className="mt-2 text-sm text-gray-500">
                Activity will appear here when users interact with the platform
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="mt-12 text-center">
          <div className="inline-flex gap-4">
            <a
              href="/"
              className="rounded-lg border border-white/20 bg-white/10 px-6 py-3 transition-all duration-300 hover:border-cyan-400/50 hover:bg-white/20"
            >
              ← Back to Home
            </a>
            <a
              href="/submit"
              className="rounded-lg border border-white/20 bg-white/10 px-6 py-3 transition-all duration-300 hover:border-purple-400/50 hover:bg-white/20"
            >
              Submit Trax
            </a>
          </div>
        </div>
      </div>

      {/* Player and Queue */}
      <div className="player-queue-section">
        <Player showId="current" />
        <QueueList showId="current" className="queue-area" />
      </div>

      {/* Admin HUD Panels */}
      <AdminHudLeft
        isOpen={isLeftPanelOpen}
        onToggle={() => setIsLeftPanelOpen(!isLeftPanelOpen)}
        label="QUEUE"
        icon={<ListMusic className="text-cyan-400" size={24} />}
        iconAnimation="pulse"
      >
        <UpcomingQueue queue={[]} isQueueLocked={false} />
      </AdminHudLeft>

      <AdminHudRight
        isOpen={isRightPanelOpen}
        onToggle={() => setIsRightPanelOpen(!isRightPanelOpen)}
        label="SUBMISSIONS"
        icon={<FileText className="text-purple-400" size={24} />}
        iconAnimation="rotate"
      >
        <SubmissionsPanel isVisible={true} />
      </AdminHudRight>
    </div>
  );
}
