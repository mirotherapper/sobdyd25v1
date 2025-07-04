import mongoose, { Schema, Document } from 'mongoose';
import { ISong } from './Song';

export interface IPlaylistItem extends Document {
  song: mongoose.Types.ObjectId | ISong;
  position: number;
  status: 'queued' | 'now_playing' | 'played';
  tier: 'VIP' | 'Skip' | 'GA' | 'Free' | 'Random Reset';
  submission_id?: mongoose.Types.ObjectId; // Reference to the original submission if applicable
}

const PlaylistItemSchema: Schema = new Schema({
  song: { type: Schema.Types.ObjectId, ref: 'Song', required: true },
  position: { type: Number, required: true },
  status: { type: String, enum: ['queued', 'now_playing', 'played'], default: 'queued' },
  tier: { type: String, enum: ['VIP', 'Skip', 'GA', 'Free', 'Random Reset'], required: true },
  submission_id: { type: Schema.Types.ObjectId, ref: 'Submission' }, // Assuming a Submission model will exist
});

export interface IPlaylist extends Document {
  name: string;
  items: mongoose.Types.ObjectId[] | IPlaylistItem[];
  is_show_archive: boolean;
  created_at: Date;
  finalized_at?: Date;
}

const PlaylistSchema: Schema = new Schema({
  name: { type: String, required: true },
  items: [{ type: Schema.Types.ObjectId, ref: 'PlaylistItem' }],
  is_show_archive: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  finalized_at: { type: Date },
});

export const PlaylistItem = mongoose.models.PlaylistItem || mongoose.model<IPlaylistItem>('PlaylistItem', PlaylistItemSchema);
export default mongoose.models.Playlist || mongoose.model<IPlaylist>('Playlist', PlaylistSchema);
