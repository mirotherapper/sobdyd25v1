import { NextResponse } from 'next/server';
import clientPromise from '../../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// GET single playlist item
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = (await clientPromise).db('traxplaya');
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          error: 'Invalid playlist item ID',
        },
        { status: 400 }
      );
    }

    const playlistItem = await db
      .collection('playlist_items')
      .findOne({ _id: new ObjectId(id) });

    if (!playlistItem) {
      return NextResponse.json(
        {
          error: 'Playlist item not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(playlistItem, { status: 200 });
  } catch (error) {
    console.error('Error fetching playlist item:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch playlist item',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// PUT/PATCH update playlist item (status changes, reordering)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = (await clientPromise).db('traxplaya');
    const updateData = await request.json();
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          error: 'Invalid playlist item ID',
        },
        { status: 400 }
      );
    }

    // Validate status if being updated
    if (
      updateData.status &&
      !['queued', 'now_playing', 'played'].includes(updateData.status)
    ) {
      return NextResponse.json(
        {
          error: 'Invalid status value',
          message: 'Status must be one of: queued, now_playing, played',
        },
        { status: 400 }
      );
    }

    // Handle special "Play Next" functionality
    if (updateData.action === 'play_next') {
      // Set current item to 'now_playing' and update any existing 'now_playing' to 'played'
      await db.collection('playlist_items').updateMany(
        { status: 'now_playing' },
        {
          $set: {
            status: 'played',
            playedAt: new Date(),
            updatedAt: new Date(),
          },
        }
      );

      updateData.status = 'now_playing';
      updateData.startedPlayingAt = new Date();
      delete updateData.action;
    }

    // Handle position reordering
    if (updateData.newPosition !== undefined) {
      const currentItem = await db
        .collection('playlist_items')
        .findOne({ _id: new ObjectId(id) });

      if (currentItem && currentItem.position !== updateData.newPosition) {
        // Reorder other items to make space
        if (updateData.newPosition > currentItem.position) {
          // Moving down - shift items up
          await db.collection('playlist_items').updateMany(
            {
              position: {
                $gt: currentItem.position,
                $lte: updateData.newPosition,
              },
              status: 'queued',
            },
            { $inc: { position: -1 } }
          );
        } else {
          // Moving up - shift items down
          await db.collection('playlist_items').updateMany(
            {
              position: {
                $gte: updateData.newPosition,
                $lt: currentItem.position,
              },
              status: 'queued',
            },
            { $inc: { position: 1 } }
          );
        }

        updateData.position = updateData.newPosition;
        delete updateData.newPosition;
      }
    }

    // Prepare update object
    const update = {
      ...updateData,
      updatedAt: new Date(),
    };

    const result = await db
      .collection('playlist_items')
      .updateOne({ _id: new ObjectId(id) }, { $set: update });

    if (result.matchedCount === 0) {
      return NextResponse.json(
        {
          error: 'Playlist item not found',
        },
        { status: 404 }
      );
    }

    // Fetch updated playlist item
    const updatedItem = await db
      .collection('playlist_items')
      .findOne({ _id: new ObjectId(id) });

    return NextResponse.json(
      {
        success: true,
        playlistItem: updatedItem,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating playlist item:', error);
    return NextResponse.json(
      {
        error: 'Failed to update playlist item',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// DELETE playlist item (remove from queue)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = (await clientPromise).db('traxplaya');
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          error: 'Invalid playlist item ID',
        },
        { status: 400 }
      );
    }

    // Get the item before deletion to adjust positions
    const itemToDelete = await db
      .collection('playlist_items')
      .findOne({ _id: new ObjectId(id) });

    if (!itemToDelete) {
      return NextResponse.json(
        {
          error: 'Playlist item not found',
        },
        { status: 404 }
      );
    }

    // Delete the item
    const result = await db
      .collection('playlist_items')
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        {
          error: 'Failed to delete playlist item',
        },
        { status: 500 }
      );
    }

    // Adjust positions of remaining items
    if (itemToDelete.status === 'queued') {
      await db.collection('playlist_items').updateMany(
        {
          position: { $gt: itemToDelete.position },
          status: 'queued',
        },
        { $inc: { position: -1 } }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Playlist item removed successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting playlist item:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete playlist item',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
