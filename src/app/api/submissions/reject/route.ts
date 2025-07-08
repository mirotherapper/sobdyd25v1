import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: Request) {
  try {
    const { db } = await connectToDatabase();
    const { submissionId } = await request.json();

    if (!submissionId) {
      return NextResponse.json({ error: 'Submission ID is required' }, { status: 400 });
    }

    // Update submission status to rejected
    const result = await db.collection('submissions').updateOne(
      { _id: new ObjectId(submissionId) },
      { 
        $set: { 
          status: 'rejected',
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error rejecting submission:', error);
    return NextResponse.json({ 
      error: 'Failed to reject submission',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
