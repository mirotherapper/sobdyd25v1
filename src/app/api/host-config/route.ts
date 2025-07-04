import { NextResponse } from 'next/server';
import clientPromise from '../../../../lib/mongodb';
import Host from '../../../../lib/models/Host';

export async function GET(request: Request) {
  try {
    await clientPromise;
    const { searchParams } = new URL(request.url);
    const hostId = searchParams.get('hostId');

    if (!hostId) {
      return NextResponse.json({ message: 'Host ID is required' }, { status: 400 });
    }

    const host = await Host.findById(hostId);

    if (!host) {
      return NextResponse.json({ message: 'Host not found' }, { status: 404 });
    }

    // Return only the necessary public configuration, e.g., Stripe publishable key
    const config = {
      stripePublishableKey: host.configuredPaymentGateways?.stripe?.publishableKey || null,
      // Add other payment gateway public keys as needed
    };

    return NextResponse.json(config, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching host config:', error);
    return NextResponse.json({ message: 'Error fetching host config', error: error.message }, { status: 500 });
  }
}
