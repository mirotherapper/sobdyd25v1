/**
 * Revenue Analytics Card Component
 * Displays real-time revenue metrics and PayPal transaction data
 * Implements: Task 6.2 - Admin Dashboard Enhancement
 */

'use client';

import React from 'react';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Users,
  Download,
} from 'lucide-react';
import { RevenueTracking } from '@/lib/types';

interface RevenueAnalyticsCardProps {
  revenue: RevenueTracking;
  isLoading?: boolean;
  className?: string;
  onExportReport?: (type: 'revenue', format: 'csv' | 'pdf' | 'json') => void;
}

const RevenueAnalyticsCard: React.FC<RevenueAnalyticsCardProps> = ({
  revenue,
  isLoading = false,
  className = '',
  onExportReport,
}) => {
  if (isLoading) {
    return (
      <div
        className={`rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-2xl ${className}`}
      >
        <div className="mb-4 flex items-center gap-4">
          <DollarSign className="text-green-400" size={24} />
          <h2 className="text-xl font-semibold">Revenue Analytics</h2>
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
          <DollarSign className="text-green-400" size={24} />
          <h2 className="text-xl font-semibold">Revenue Analytics</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-green-400" size={16} />
            <span className="text-sm font-medium text-green-400">
              +{revenue.monthlyGrowth.toFixed(1)}% this month
            </span>
          </div>
          {onExportReport && (
            <button
              onClick={() => onExportReport('revenue', 'pdf')}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1 text-sm transition-colors hover:bg-blue-700"
            >
              <Download size={14} />
              Export
            </button>
          )}
        </div>
      </div>

      {/* Total Revenue Display */}
      <div className="mb-6 text-center">
        <div className="text-3xl font-bold text-green-400">
          ${revenue.totalRevenue.toFixed(2)}
        </div>
        <div className="text-sm text-gray-400">Total Revenue</div>
      </div>

      {/* Time-based Revenue Grid */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-lg bg-gray-800/50 p-4 text-center">
          <div className="text-xl font-bold text-cyan-400">
            ${revenue.revenueToday.toFixed(2)}
          </div>
          <div className="text-sm text-gray-400">Today</div>
        </div>
        <div className="rounded-lg bg-gray-800/50 p-4 text-center">
          <div className="text-xl font-bold text-purple-400">
            ${revenue.revenueThisWeek.toFixed(2)}
          </div>
          <div className="text-sm text-gray-400">This Week</div>
        </div>
        <div className="rounded-lg bg-gray-800/50 p-4 text-center">
          <div className="text-xl font-bold text-pink-400">
            ${revenue.revenueThisMonth.toFixed(2)}
          </div>
          <div className="text-sm text-gray-400">This Month</div>
        </div>
      </div>

      {/* Revenue by Que-Up */}
      <div className="mb-6">
        <h3 className="mb-3 text-lg font-medium">Revenue by Que-Up</h3>
        <div className="space-y-3">
          {Object.entries(revenue.revenueByTier).map(([tier, amount]) => (
            <div key={tier} className="flex items-center justify-between">
              <span className="text-gray-300">{tier}</span>
              <div className="flex items-center gap-2">
                <div className="h-3 w-20 overflow-hidden rounded-full bg-gray-700">
                  <div
                    className={`h-full rounded-full ${
                      tier === 'VIP'
                        ? 'bg-purple-500'
                        : tier === 'Skip'
                          ? 'bg-cyan-500'
                          : 'bg-green-500'
                    }`}
                    style={{
                      width: `${(amount / revenue.totalRevenue) * 100}%`,
                    }}
                  />
                </div>
                <span className="w-16 text-right font-medium text-white">
                  ${amount.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PayPal Transactions */}
      <div className="mb-6 rounded-lg bg-gray-800/30 p-4">
        <div className="mb-3 flex items-center gap-2">
          <CreditCard className="text-blue-400" size={20} />
          <h3 className="text-lg font-medium">PayPal Transactions</h3>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="text-center">
            <div className="text-lg font-bold text-white">
              {revenue.paypalTransactions.total}
            </div>
            <div className="text-xs text-gray-400">Total</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-400">
              {revenue.paypalTransactions.completed}
            </div>
            <div className="text-xs text-gray-400">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-yellow-400">
              {revenue.paypalTransactions.pending}
            </div>
            <div className="text-xs text-gray-400">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-red-400">
              {revenue.paypalTransactions.failed}
            </div>
            <div className="text-xs text-gray-400">Failed</div>
          </div>
        </div>
      </div>

      {/* Top Paying Users */}
      {revenue.topPayingUsers.length > 0 && (
        <div className="mb-4">
          <div className="mb-3 flex items-center gap-2">
            <Users className="text-yellow-400" size={20} />
            <h3 className="text-lg font-medium">Top Paying Users</h3>
          </div>
          <div className="space-y-2">
            {revenue.topPayingUsers.slice(0, 3).map((user, index) => (
              <div
                key={user.userId}
                className="flex items-center justify-between rounded-lg bg-gray-800/40 p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 text-xs font-bold">
                    {index + 1}
                  </div>
                  <span className="font-medium text-white">
                    {user.username}
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-400">
                    ${user.totalSpent.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-400">
                    {user.submissionCount} submissions
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Additional Metrics */}
      <div className="border-t border-gray-600 pt-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Avg per submission:</span>
          <span className="font-medium text-white">
            ${revenue.avgRevenuePerSubmission.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default RevenueAnalyticsCard;
