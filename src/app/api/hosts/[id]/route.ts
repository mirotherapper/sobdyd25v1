import { NextResponse } from 'next/server';
import clientPromise from '../../../../../lib/mongodb';
import Host from '../../../../../lib/models/Host';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    await clientPromise;
    const { id } = await params;

    const host = await Host.findById(id).populate('currentSubscription');

    if (!host) {
      return NextResponse.json({ message: 'Host not found' }, { status: 404 });
    }

    // Ensure the requesting user is the host or an admin
    if (userId !== host.clerkUserId) {
      // In a real app, you'd check for admin role here
      return new NextResponse("Forbidden: You can only access your own host profile", { status: 403 });
    }

    return NextResponse.json(host, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching host:', error);
    return NextResponse.json({ message: 'Error fetching host', error: error.message }, { status: 500 });
  }
}
