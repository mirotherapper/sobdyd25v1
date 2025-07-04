import { NextResponse } from 'next/server';
import clientPromise from '../../../../lib/mongodb';
import Artist from '../../../../lib/models/Artist';
import { auth } from '@clerk/nextjs/server';

// This is a simplified example. In a real application, you would:
// 1. Use Clerk's Backend SDK to fetch the user's connected accounts and their access tokens.
// 2. Make authenticated API calls to Spotify, YouTube, SoundCloud, etc., using those tokens.
// 3. Parse the real data from those APIs.

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    await clientPromise;
    const { clerkUserId } = await request.json();

    if (!clerkUserId) {
      return NextResponse.json({ message: 'Clerk User ID is required' }, { status: 400 });
    }

    // Ensure the requesting user is the one whose profile is being synced
    if (userId !== clerkUserId) {
      return new NextResponse("Forbidden: You can only sync your own artist profile", { status: 403 });
    }

    // Simulate fetching data from music platforms using Clerk's connected accounts
    // In a real scenario, you'd get actual tokens from Clerk and make real API calls.
    const simulatedArtistData = {
      name: `Artist_${clerkUserId.substring(0, 8)}`, // Placeholder name
      bio: `This is a simulated bio for artist ${clerkUserId}. They are passionate about music.`, // Placeholder bio
      profileImage: '/placeholder-user.jpg',
      socialLink: 'https://example.com/artist_social',
      embedLinks: [
        'https://www.youtube.com/embed/dQw4w9WgXcQ', // Rick Astley - Never Gonna Give You Up
        'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/293&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true',
      ],
      currentProject: 'Simulated New Album',
      latestAlbum: 'Simulated Latest Release',
      newsFeed: 'Just released a new track on all platforms!',
      genres: ['Pop', 'Electronic'],
      followers: Math.floor(Math.random() * 100000) + 1000, // Random followers
      spotifyId: 'simulated_spotify_id',
      youtubeChannelId: 'simulated_youtube_id',
      soundcloudId: 'simulated_soundcloud_id',
      appleMusicId: 'simulated_applemusic_id',
    };

    // Find or create the artist profile
    let artist = await Artist.findOneAndUpdate(
      { clerkUserId },
      { $set: simulatedArtistData },
      { upsert: true, new: true }
    );

    return NextResponse.json({ message: 'Artist profile synced successfully', artist }, { status: 200 });
  } catch (error: any) {
    console.error('Error syncing artist profile:', error);
    return NextResponse.json({ message: 'Error syncing artist profile', error: error.message }, { status: 500 });
  }
}
