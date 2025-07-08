import mongoose, { Document, Schema, models } from 'mongoose';

export interface ITrack extends Document {
  title: string;
  artist: string;
  audioUrl: string;
  imageUrl?: string;
  submittedBy: string; // User ID from Clerk
  submissionNotes?: string;
  status: 'submitted' | 'voting' | 'approved' | 'queued' | 'played';
  rating: number;
  priority: 'guaranteed' | 'vip' | 'chance' | 'standard';
  hostFeedback?: string;
  createdAt: Date;
}

const TrackSchema: Schema = new Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  audioUrl: { type: String, required: true },
  imageUrl: { type: String, default: '/images/album-art-placeholder.png' },
  submittedBy: { type: String, required: true },
  submissionNotes: { type: String },
  status: { type: String, enum: ['submitted', 'voting', 'approved', 'queued', 'played'], default: 'submitted' },
  rating: { type: Number, default: 0 },
  priority: { type: String, enum: ['guaranteed', 'vip', 'chance', 'standard'], default: 'standard' },
  hostFeedback: { type: String },
}, { timestamps: true });

const Track = models.Track || mongoose.model<ITrack>('Track', TrackSchema);

export default Track;