import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';

export async function POST(request: Request) {
  try {
    const { db } = await connectToDatabase();
    const submissionData = await request.json();

    // Create submission object
    const submission = {
      ...submissionData,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('submissions').insertOne(submission);

    return NextResponse.json({ 
      success: true, 
      submissionId: result.insertedId 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating submission:', error);
    return NextResponse.json({ 
      error: 'Failed to create submission',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';

    const submissions = await db
      .collection('submissions')
      .find({ status })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(submissions, { status: 200 });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch submissions',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
