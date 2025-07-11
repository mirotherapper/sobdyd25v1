import { NextResponse } from 'next/server';
import clientPromise from '../../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// GET single submission by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = (await clientPromise).db('traxplaya');
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          error: 'Invalid submission ID',
        },
        { status: 400 }
      );
    }

    const submission = await db
      .collection('submissions')
      .findOne({ _id: new ObjectId(id) });

    if (!submission) {
      return NextResponse.json(
        {
          error: 'Submission not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(submission, { status: 200 });
  } catch (error) {
    console.error('Error fetching submission:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch submission',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// PUT/PATCH update submission (for admin status changes)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = (await clientPromise).db('traxplaya');
    const updateData = await request.json();
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          error: 'Invalid submission ID',
        },
        { status: 400 }
      );
    }

    // Validate status if being updated
    if (
      updateData.status &&
      !['pending', 'approved', 'rejected', 'processed'].includes(
        updateData.status
      )
    ) {
      return NextResponse.json(
        {
          error: 'Invalid status value',
          message:
            'Status must be one of: pending, approved, rejected, processed',
        },
        { status: 400 }
      );
    }

    // Prepare update object
    const update = {
      ...updateData,
      updatedAt: new Date(),
    };

    const result = await db
      .collection('submissions')
      .updateOne({ _id: new ObjectId(id) }, { $set: update });

    if (result.matchedCount === 0) {
      return NextResponse.json(
        {
          error: 'Submission not found',
        },
        { status: 404 }
      );
    }

    // Fetch updated submission
    const updatedSubmission = await db
      .collection('submissions')
      .findOne({ _id: new ObjectId(id) });

    return NextResponse.json(
      {
        success: true,
        submission: updatedSubmission,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating submission:', error);
    return NextResponse.json(
      {
        error: 'Failed to update submission',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// DELETE submission (admin only)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = (await clientPromise).db('traxplaya');
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          error: 'Invalid submission ID',
        },
        { status: 400 }
      );
    }

    const result = await db
      .collection('submissions')
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        {
          error: 'Submission not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Submission deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting submission:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete submission',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
