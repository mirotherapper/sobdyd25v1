import mongoose, { Schema, Document } from 'mongoose';

export interface ISong extends Document {
  title: string;
  artist: mongoose.Types.ObjectId | string;
  url: string;
  platform: 'youtube' | 'spotify' | 'soundcloud' | 'bandcamp' | 'local';
  duration: number;
  artwork: string;
  submissionDate: Date;
  is_video: boolean;
  media_type: 'hls' | 'youtube' | 'soundcloud' | 'spotify' | 'bandcamp';
  hls_url?: string;
  cover_art_url?: string;
  submission_message?: string;
}

const SongSchema: Schema = new Schema({
  title: { type: String, required: true },
  artist: { type: Schema.Types.ObjectId, ref: 'Artist', required: true },
  url: { type: String, required: true, unique: true },
  platform: { type: String, enum: ['youtube', 'spotify', 'soundcloud', 'bandcamp', 'local'], required: true },
  duration: { type: Number, required: true },
  artwork: { type: String, required: true },
  submissionDate: { type: Date, default: Date.now },
  is_video: { type: Boolean, default: false },
  media_type: { type: String, enum: ['hls', 'youtube', 'soundcloud', 'spotify', 'bandcamp'], required: true },
  hls_url: { type: String },
  cover_art_url: { type: String },
  submission_message: { type: String },
});

export default mongoose.models.Song || mongoose.model<ISong>('Song', SongSchema);
