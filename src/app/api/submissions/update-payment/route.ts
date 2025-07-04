import { NextResponse } from 'next/server';
import clientPromise from '../../../../../lib/mongodb';
import Submission from '../../../../../lib/models/Submission';

export async function POST(request: Request) {
  try {
    await clientPromise;

    const { submissionId, paypalOrderId, payer } = await request.json();

    if (!submissionId || !paypalOrderId) {
      return NextResponse.json(
        { error: 'Missing required fields: submissionId and paypalOrderId' },
        { status: 400 }
      );
    }

    const submission = await Submission.findById(submissionId);

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    // Update the submission with payment details
    submission.paymentStatus = 'Paid';
    submission.paypalOrderId = paypalOrderId;
    submission.paymentDetails = {
      payerId: payer.payer_id,
      email: payer.email_address,
      name: `${payer.name.given_name} ${payer.name.surname}`,
    };
    
    await submission.save();

    return NextResponse.json({ message: 'Payment status updated successfully', submissionId: submission._id });
  } catch (error) {
    console.error('Error updating payment status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}