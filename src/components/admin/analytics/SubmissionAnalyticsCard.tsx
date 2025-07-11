/**
 * Submission Analytics Card Component
 * Displays real-time submission metrics and conversion rates
 * Implements: Task 6.2 - Admin Dashboard Enhancement
 */

'use client';

import React from 'react';
import { FileText, TrendingUp } from 'lucide-react';
import { SubmissionAnalytics } from '@/lib/types';

interface SubmissionAnalyticsCardProps {
  analytics: SubmissionAnalytics;
  isLoading?: boolean;
  className?: string;
}

const SubmissionAnalyticsCard: React.FC<SubmissionAnalyticsCardProps> = ({
  analytics,
  isLoading = false,
  className = '',
}) => {
  if (isLoading) {
    return (
      <div
        className={`rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-2xl ${className}`}
      >
        <div className="mb-4 flex items-center gap-4">
          <FileText className="text-blue-400" size={24} />
          <h2 className="text-xl font-semibold">Submission Analytics</h2>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-3/4 rounded bg-gray-600"></div>
          <div className="h-4 w-1/2 rounded bg-gray-600"></div>
          <div className="h-4 w-2/3 rounded bg-gray-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-2xl ${className}`}
    >
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <FileText className="text-blue-400" size={24} />
          <h2 className="text-xl font-semibold">Submission Analytics</h2>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="text-green-400" size={16} />
          <span className="text-sm font-medium text-green-400">
            {analytics.conversionRate.toFixed(1)}% approval rate
          </span>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">
            {analytics.totalSubmissions}
          </div>
          <div className="text-sm text-gray-400">Total</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {analytics.pendingSubmissions}
          </div>
          <div className="text-sm text-gray-400">Pending</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">
            {analytics.approvedSubmissions}
          </div>
          <div className="text-sm text-gray-400">Approved</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-400">
            {analytics.rejectedSubmissions}
          </div>
          <div className="text-sm text-gray-400">Rejected</div>
        </div>
      </div>

      {/* Que-Up Breakdown */}
      <div className="mb-6">
        <h3 className="mb-3 text-lg font-medium">Submissions by Que-Up</h3>
        <div className="space-y-2">
          {Object.entries(analytics.submissionsByTier).map(([tier, count]) => (
            <div key={tier} className="flex items-center justify-between">
              <span className="text-gray-300">{tier}</span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-16 overflow-hidden rounded-full bg-gray-700">
                  <div
                    className={`h-full rounded-full ${
                      tier === 'VIP'
                        ? 'bg-purple-500'
                        : tier === 'Skip'
                          ? 'bg-cyan-500'
                          : tier === 'GA'
                            ? 'bg-green-500'
                            : tier === 'Free'
                              ? 'bg-blue-500'
                              : 'bg-orange-500'
                    }`}
                    style={{
                      width: `${(count / analytics.totalSubmissions) * 100}%`,
                    }}
                  />
                </div>
                <span className="w-8 text-right font-medium text-white">
                  {count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Time-based Stats */}
      <div className="grid grid-cols-3 gap-4 border-t border-gray-600 pt-4">
        <div className="text-center">
          <div className="text-lg font-bold text-cyan-400">
            {analytics.submissionsToday}
          </div>
          <div className="text-xs text-gray-400">Today</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-purple-400">
            {analytics.submissionsThisWeek}
          </div>
          <div className="text-xs text-gray-400">This Week</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-pink-400">
            {analytics.submissionsThisMonth}
          </div>
          <div className="text-xs text-gray-400">This Month</div>
        </div>
      </div>

      {/* Additional Insights */}
      <div className="mt-4 border-t border-gray-600 pt-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Avg per day:</span>
          <span className="font-medium text-white">
            {analytics.avgSubmissionsPerDay.toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SubmissionAnalyticsCard;
