import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { AnalyticsEvent } from '@/lib/db/models/AnalyticsEvent';
import { AnalyticsSession } from '@/lib/db/models/AnalyticsSession';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const period = searchParams.get('period') || '7d'; // 24h, 7d, 30d, 90d

    // Calculate date range
    const now = new Date();
    let dateFilter: Date;
    
    switch (period) {
      case '24h':
        dateFilter = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        dateFilter = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    if (startDate) dateFilter = new Date(startDate);
    const endDateFilter = endDate ? new Date(endDate) : now;

    // Build aggregation pipeline for comprehensive analytics
    const [
      totalEvents,
      totalSessions,
      activeUsers,
      trackPlayStats,
      submissionStats,
      quequeStats,
      playerActionStats,
      topTracks,
      userEngagement,
      realTimeMetrics
    ] = await Promise.all([
      // Total events in period
      AnalyticsEvent.countDocuments({
        timestamp: { $gte: dateFilter, $lte: endDateFilter }
      }),

      // Total sessions in period
      AnalyticsSession.countDocuments({
        startTime: { $gte: dateFilter, $lte: endDateFilter }
      }),

      // Active unique users
      AnalyticsEvent.distinct('userId', {
        timestamp: { $gte: dateFilter, $lte: endDateFilter },
        userId: { $exists: true, $ne: null }
      }),

      // Track play statistics
      AnalyticsEvent.aggregate([
        {
          $match: {
            eventType: 'track_play',
            timestamp: { $gte: dateFilter, $lte: endDateFilter }
          }
        },
        {
          $group: {
            _id: null,
            totalPlays: { $sum: 1 },
            uniqueTracks: { $addToSet: '$properties.trackId' },
            avgPlayDuration: { $avg: '$properties.playbackPosition' }
          }
        }
      ]),

      // Submission statistics
      AnalyticsEvent.aggregate([
        {
          $match: {
            eventType: 'submission',
            timestamp: { $gte: dateFilter, $lte: endDateFilter }
          }
        },
        {
          $group: {
            _id: '$properties.submissionType',
            count: { $sum: 1 }
          }
        }
      ]),

      // Que-Up actions (following DoYouDj naming convention)
      AnalyticsEvent.aggregate([
        {
          $match: {
            eventType: 'queue_action',
            timestamp: { $gte: dateFilter, $lte: endDateFilter }
          }
        },
        {
          $group: {
            _id: '$properties.action',
            count: { $sum: 1 }
          }
        }
      ]),

      // Player actions
      AnalyticsEvent.aggregate([
        {
          $match: {
            eventType: 'player_action',
            timestamp: { $gte: dateFilter, $lte: endDateFilter }
          }
        },
        {
          $group: {
            _id: '$properties.action',
            count: { $sum: 1 }
          }
        }
      ]),

      // Top tracks played
      AnalyticsEvent.aggregate([
        {
          $match: {
            eventType: 'track_play',
            timestamp: { $gte: dateFilter, $lte: endDateFilter },
            'properties.trackTitle': { $exists: true }
          }
        },
        {
          $group: {
            _id: {
              trackId: '$properties.trackId',
              title: '$properties.trackTitle',
              artist: '$properties.trackArtist'
            },
            playCount: { $sum: 1 },
            avgDuration: { $avg: '$properties.playbackPosition' }
          }
        },
        { $sort: { playCount: -1 } },
        { $limit: 10 }
      ]),

      // User engagement metrics
      AnalyticsSession.aggregate([
        {
          $match: {
            startTime: { $gte: dateFilter, $lte: endDateFilter }
          }
        },
        {
          $group: {
            _id: null,
            avgSessionDuration: { $avg: '$duration' },
            avgPageViews: { $avg: '$pageViews' },
            avgEvents: { $avg: '$events' },
            bounceRate: { 
              $avg: { 
                $cond: [{ $lte: ['$pageViews', 1] }, 1, 0] 
              }
            }
          }
        }
      ]),

      // Real-time metrics (last hour)
      AnalyticsEvent.aggregate([
        {
          $match: {
            timestamp: { $gte: new Date(now.getTime() - 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d-%H-%M',
                date: '$timestamp'
              }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    // Calculate additional metrics
    const uniqueTrackCount = trackPlayStats[0]?.uniqueTracks?.length || 0;
    const activeUserCount = activeUsers.length;

    const dashboardData = {
      overview: {
        totalEvents,
        totalSessions,
        activeUsers: activeUserCount,
        period
      },
      trackMetrics: {
        totalPlays: trackPlayStats[0]?.totalPlays || 0,
        uniqueTracks: uniqueTrackCount,
        avgPlayDuration: trackPlayStats[0]?.avgPlayDuration || 0
      },
      submissions: {
        byType: submissionStats.reduce((acc: any, item: any) => {
          acc[item._id || 'unknown'] = item.count;
          return acc;
        }, {}),
        total: submissionStats.reduce((sum: number, item: any) => sum + item.count, 0)
      },
      quequeActions: {
        byAction: quequeStats.reduce((acc: any, item: any) => {
          acc[item._id || 'unknown'] = item.count;
          return acc;
        }, {}),
        total: quequeStats.reduce((sum: number, item: any) => sum + item.count, 0)
      },
      playerActions: {
        byAction: playerActionStats.reduce((acc: any, item: any) => {
          acc[item._id || 'unknown'] = item.count;
          return acc;
        }, {}),
        total: playerActionStats.reduce((sum: number, item: any) => sum + item.count, 0)
      },
      topTracks: topTracks.map((track: any) => ({
        trackId: track._id.trackId,
        title: track._id.title,
        artist: track._id.artist,
        playCount: track.playCount,
        avgDuration: track.avgDuration
      })),
      engagement: {
        avgSessionDuration: userEngagement[0]?.avgSessionDuration || 0,
        avgPageViews: userEngagement[0]?.avgPageViews || 0,
        avgEvents: userEngagement[0]?.avgEvents || 0,
        bounceRate: userEngagement[0]?.bounceRate || 0
      },
      realTime: realTimeMetrics
    };

    return NextResponse.json(dashboardData);

  } catch (error) {
    console.error('Analytics dashboard error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve dashboard analytics' },
      { status: 500 }
    );
  }
}
