import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../../lib/mongodb';
import { PlaylistData } from '../../../../../lib/types';

export async function GET(request: Request) {
  try {
    const { db } = await connectToDatabase();

    // Find or create the live playlist
    let livePlaylist = await db.collection('playlists').findOne(
      { name: 'Live Show' }
    );

    if (!livePlaylist) {
      // Create live playlist if it doesn't exist
      const result = await db.collection('playlists').insertOne({
        name: 'Live Show',
        items: [],
        is_show_archive: false,
        is_locked: false,
        created_at: new Date()
      });
      livePlaylist = await db.collection('playlists').findOne({ _id: result.insertedId });
    }

    // Populate song data for playlist items
    const populatedItems = [];
    if (livePlaylist?.items && livePlaylist.items.length > 0) {
      for (const item of livePlaylist.items) {
        const song = await db.collection('songs').findOne({ _id: item.song });
        if (song) {
          populatedItems.push({
            ...item,
            song: {
              _id: song._id.toString(),
              title: song.title,
              artist: song.artist,
              url: song.url,
              platform: song.platform,
              artwork: song.artwork,
              duration: song.duration,
              is_video: song.is_video
            }
          });
        }
      }
    }

    if (!livePlaylist) {
      return NextResponse.json({ message: 'Failed to create or find live playlist' }, { status: 500 });
    }

    const response = {
      _id: livePlaylist._id.toString(),
      name: livePlaylist.name,
      items: populatedItems,
      is_show_archive: livePlaylist.is_show_archive,
      is_locked: livePlaylist.is_locked,
      created_at: livePlaylist.created_at
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error fetching live playlist:', error);
    return NextResponse.json({ message: 'Error fetching live playlist', error }, { status: 500 });
  }
}
