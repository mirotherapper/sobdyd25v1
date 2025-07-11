import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { AnalyticsEvent } from '@/lib/db/models/AnalyticsEvent';
import { AnalyticsSession } from '@/lib/db/models/AnalyticsSession';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { events, session } = body;

    if (!events || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { error: 'No events provided' },
        { status: 400 }
      );
    }

    // Store or update session
    if (session) {
      await AnalyticsSession.findOneAndUpdate(
        { sessionId: session.sessionId },
        {
          ...session,
          lastActivity: new Date(session.lastActivity),
          startTime: new Date(session.startTime),
        },
        { upsert: true, new: true }
      );
    }

    // Store events
    const analyticsEvents = events.map((event: any) => ({
      ...event,
      timestamp: new Date(event.timestamp),
      createdAt: new Date(),
    }));

    await AnalyticsEvent.insertMany(analyticsEvents);

    return NextResponse.json({ success: true, eventsStored: events.length });
  } catch (error) {
    console.error('Analytics tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to store analytics data' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const eventType = searchParams.get('eventType');
    const limit = parseInt(searchParams.get('limit') || '100');

    // Build query
    const query: any = {};

    if (sessionId) query.sessionId = sessionId;
    if (userId) query.userId = userId;
    if (eventType) query.event = eventType;

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const events = await AnalyticsEvent.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({ events });
  } catch (error) {
    console.error('Analytics retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve analytics data' },
      { status: 500 }
    );
  }
}
