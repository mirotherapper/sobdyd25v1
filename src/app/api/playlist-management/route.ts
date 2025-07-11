import { NextResponse } from 'next/server';
import clientPromise from '../../../../lib/mongodb';
import Playlist from '../../../lib/db/models/Playlist';
import Host from '../../../lib/db/models/Host';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    await clientPromise;
    const host = await Host.findOne({ clerkUserId: userId });
    if (!host) {
      return new NextResponse('Forbidden: Not a registered host', {
        status: 403,
      });
    }

    const body = await request.json();
    const newPlaylist = new Playlist(body);
    await newPlaylist.save();
    return NextResponse.json(
      { message: 'Playlist created successfully', playlist: newPlaylist },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Error creating playlist:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { message: 'Error creating playlist', error: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    await clientPromise;
    const host = await Host.findOne({ clerkUserId: userId });
    if (!host) {
      return new NextResponse('Forbidden: Not a registered host', {
        status: 403,
      });
    }

    // In a real app, you'd filter playlists based on the hostId
    const playlists = await Playlist.find({}).populate('items');
    return NextResponse.json(playlists, { status: 200 });
  } catch (error: unknown) {
    console.error('Error fetching playlists:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { message: 'Error fetching playlists', error: errorMessage },
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
    const host = await Host.findOne({ clerkUserId: userId });
    if (!host) {
      return new NextResponse('Forbidden: Not a registered host', {
        status: 403,
      });
    }

    const { _id, ...updateData } = await request.json();
    const updatedPlaylist = await Playlist.findByIdAndUpdate(_id, updateData, {
      new: true,
    }).populate('items');
    if (!updatedPlaylist) {
      return NextResponse.json(
        { message: 'Playlist not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: 'Playlist updated successfully', playlist: updatedPlaylist },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error updating playlist:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { message: 'Error updating playlist', error: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    await clientPromise;
    const host = await Host.findOne({ clerkUserId: userId });
    if (!host) {
      return new NextResponse('Forbidden: Not a registered host', {
        status: 403,
      });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { message: 'Playlist ID is required' },
        { status: 400 }
      );
    }

    const deletedPlaylist = await Playlist.findByIdAndDelete(id);
    if (!deletedPlaylist) {
      return NextResponse.json(
        { message: 'Playlist not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: 'Playlist deleted successfully' },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error deleting playlist:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { message: 'Error deleting playlist', error: errorMessage },
      { status: 500 }
    );
  }
}
