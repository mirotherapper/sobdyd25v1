import { NextResponse } from 'next/server';
import clientPromise from '../../../../lib/mongodb';
import Song from '../../../../lib/models/Song';

export async function GET() {
  try {
    await clientPromise;
    const songs = await Song.find({}).populate('artist');
    return NextResponse.json(songs, { status: 200 });
  } catch (error) {
    console.error('Error fetching songs:', error);
    return NextResponse.json({ message: 'Error fetching songs', error: (error as Error).message }, { status: 500 });
  }
}
