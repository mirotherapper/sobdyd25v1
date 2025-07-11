/**
 * Queue Management Component
 * Provides real-time queue management with drag-and-drop
 */

'use client';

import React, { useCallback } from 'react';
import Image from 'next/image';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { PlaylistItemData } from '@/lib/types';
import { usePlayerState } from '@/lib/hooks/usePlayerState';
import { XCircle, Grip, Play } from 'lucide-react';

interface QueueListProps {
  showId?: string;
  className?: string;
}

const QueueList: React.FC<QueueListProps> = ({ showId, className }) => {
  const { queue, isQueueLocked, playControls } = usePlayerState(showId);

  const handleDragEnd = useCallback(
    (result: any) => {
      if (!result.destination || isQueueLocked) return;

      const itemId = result.draggableId;
      const newPosition = result.destination.index;
      playControls.moveInQueue(itemId, newPosition);
    },
    [isQueueLocked, playControls]
  );

  const handleRemove = useCallback(
    (id: string) => {
      if (!isQueueLocked) {
        playControls.removeFromQueue(id);
      }
    },
    [isQueueLocked, playControls]
  );

  if (queue.length === 0) {
    return (
      <div className={`queue-empty ${className || ''}`}>
        <p className="text-gray-400">No trax in queue</p>
      </div>
    );
  }

  return (
    <div className={`queue-container ${className || ''}`}>
      <div className="queue-header">
        <h2>Queue</h2>
        {isQueueLocked && <span className="queue-locked-badge">Locked</span>}
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="queue-list" isDropDisabled={isQueueLocked}>
          {provided => (
            <ul
              className="queue-list"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {queue.map((item, index) => (
                <Draggable
                  key={item._id}
                  draggableId={item._id}
                  index={index}
                  isDragDisabled={isQueueLocked}
                >
                  {(provided, snapshot) => (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`queue-item ${
                        snapshot.isDragging ? 'dragging' : ''
                      }`}
                    >
                      <div className="queue-position">{index + 1}</div>
                      <div
                        {...provided.dragHandleProps}
                        className="queue-drag-handle"
                      >
                        <Grip size={16} />
                      </div>
                      <div className="queue-thumbnail">
                        <Image
                          src={item.metadata?.artwork || '/default-artwork.jpg'}
                          alt={item.metadata?.title || 'Trax'}
                          width={48}
                          height={48}
                          className="rounded-md"
                        />
                      </div>
                      <div className="queue-details">
                        <div className="queue-title">
                          {item.metadata?.title || 'Unknown Trax'}
                        </div>
                        <div className="queue-artist">
                          {item.metadata?.artist || 'Unknown Artist'}
                        </div>
                      </div>
                      <div className="queue-actions">
                        <button
                          onClick={() => handleRemove(item._id)}
                          className="queue-remove-btn"
                          disabled={isQueueLocked}
                          title="Remove from queue"
                        >
                          <XCircle size={16} />
                        </button>
                        <button
                          onClick={() => playControls.next()}
                          className="queue-play-next-btn"
                          title="Play next"
                        >
                          <Play size={16} />
                        </button>
                      </div>
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default QueueList;
