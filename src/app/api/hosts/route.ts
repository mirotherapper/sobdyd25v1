import { NextResponse } from 'next/server';
import clientPromise from '../../../../lib/mongodb';
import Host from '../../../lib/db/models/Host';
import HostSubscription from '../../../lib/db/models/HostSubscription';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: Request) {
  try {
    await clientPromise;
    const body = await request.json();
    const { clerkUserId, name, email, tier, paymentMethod, paymentDetails } =
      body;

    // Check if host already exists
    let host = await Host.findOne({ clerkUserId });

    if (host) {
      return NextResponse.json(
        { message: 'Host already exists', host },
        { status: 409 }
      );
    }

    // Create a new subscription for the host
    const newSubscription = new HostSubscription({
      clerkUserId,
      tier,
      paymentMethod,
      paymentDetails,
      isActive: true,
    });
    await newSubscription.save();

    // Create the new host
    host = new Host({
      clerkUserId,
      name,
      email,
      currentSubscription: newSubscription._id,
    });
    await host.save();

    return NextResponse.json(
      { message: 'Host created successfully', host },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Error creating host:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { message: 'Error creating host', error: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    await clientPromise;
    const { searchParams } = new URL(request.url);
    const clerkUserId = searchParams.get('clerkUserId');

    if (!clerkUserId) {
      return NextResponse.json(
        { message: 'Clerk User ID is required' },
        { status: 400 }
      );
    }

    // Ensure the requesting user is either the host or an admin
    if (userId !== clerkUserId) {
      // In a real app, you'd check for admin role here
      return new NextResponse(
        'Forbidden: You can only access your own host data',
        { status: 403 }
      );
    }

    const host = await Host.findOne({ clerkUserId }).populate(
      'currentSubscription'
    );

    if (!host) {
      return NextResponse.json({ message: 'Host not found' }, { status: 404 });
    }

    return NextResponse.json(host, { status: 200 });
  } catch (error: unknown) {
    console.error('Error fetching host:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { message: 'Error fetching host', error: errorMessage },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    await clientPromise;
    const body = await request.json();
    const { clerkUserId, ...updateData } = body;

    if (!clerkUserId) {
      return NextResponse.json(
        { message: 'Clerk User ID is required' },
        { status: 400 }
      );
    }

    // Ensure the requesting user is the host they are trying to update
    if (userId !== clerkUserId) {
      return new NextResponse(
        'Forbidden: You can only update your own host data',
        { status: 403 }
      );
    }

    const updatedHost = await Host.findOneAndUpdate(
      { clerkUserId },
      updateData,
      { new: true }
    ).populate('currentSubscription');

    if (!updatedHost) {
      return NextResponse.json({ message: 'Host not found' }, { status: 404 });
    }

    return NextResponse.json(
      { message: 'Host updated successfully', host: updatedHost },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error updating host:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { message: 'Error updating host', error: errorMessage },
      { status: 500 }
    );
  }
}
