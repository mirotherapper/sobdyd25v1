import { NextResponse } from 'next/server';
import clientPromise from '../../../../lib/mongodb';
import Artist from '../../../../lib/models/Artist';

export async function GET() {
  try {
    await clientPromise;
    const artists = await Artist.find({}).populate('songs');
    return NextResponse.json(artists, { status: 200 });
  } catch (error) {
    console.error('Error fetching artists:', error);
    return NextResponse.json({ message: 'Error fetching artists', error: (error as Error).message }, { status: 500 });
  }
}
