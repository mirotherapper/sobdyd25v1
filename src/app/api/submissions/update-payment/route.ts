import { NextResponse } from 'next/server';
import clientPromise from '../../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: Request) {
  try {
    const db = (await clientPromise).db('traxplaya');
    const { submissionId, paypalOrderId, payer } = await request.json();

    // Validate required fields
    if (!submissionId || !paypalOrderId) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          message: 'submissionId and paypalOrderId are required',
        },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(submissionId)) {
      return NextResponse.json(
        {
          error: 'Invalid submission ID',
        },
        { status: 400 }
      );
    }

    // Find the submission
    const submission = await db
      .collection('submissions')
      .findOne({ _id: new ObjectId(submissionId) });

    if (!submission) {
      return NextResponse.json(
        {
          error: 'Submission not found',
        },
        { status: 404 }
      );
    }

    // Prepare payment details
    const paymentDetails: any = {
      paymentStatus: 'completed',
      paypalOrderId: paypalOrderId,
      paidAt: new Date(),
      status: 'approved', // Auto-approve paid submissions
      updatedAt: new Date(),
    };

    // Add payer information if provided
    if (payer) {
      paymentDetails.paymentDetails = {
        payerId: payer.payer_id || payer.payerID,
        email: payer.email_address || payer.email,
        name: payer.name
          ? `${payer.name.given_name || ''} ${payer.name.surname || ''}`.trim()
          : 'Unknown',
      };
    }

    // Update submission with payment information
    const updateResult = await db
      .collection('submissions')
      .updateOne({ _id: new ObjectId(submissionId) }, { $set: paymentDetails });

    if (updateResult.matchedCount === 0) {
      return NextResponse.json(
        {
          error: 'Failed to update submission',
        },
        { status: 500 }
      );
    }

    // Get the updated submission
    const updatedSubmission = await db
      .collection('submissions')
      .findOne({ _id: new ObjectId(submissionId) });

    console.log('Payment verified successfully:', {
      submissionId,
      paypalOrderId,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Payment verified and submission approved',
        submissionId: submissionId,
        submission: updatedSubmission,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating payment:', error);
    return NextResponse.json(
      {
        error: 'Failed to update payment status',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
