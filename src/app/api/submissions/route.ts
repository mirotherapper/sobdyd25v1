import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';

export async function GET(request: Request) {
  try {
    const { db } = await connectToDatabase();

    const submissions = await db
      .collection('submissions')
      .find({ status: 'pending' }) // Example filter
      .sort({ createdAt: -1 }) // Example sort
      .toArray();

    return NextResponse.json(submissions, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching submissions', error }, { status: 500 });
  }
}