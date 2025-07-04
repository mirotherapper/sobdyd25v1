import mongoose, { Schema, Document } from 'mongoose';

export interface ISubmission extends Document {
  url: string;
  platform: 'youtube' | 'spotify' | 'soundcloud' | 'bandcamp' | 'local';
  submissionType: 'VIP' | 'Skip' | 'GA' | 'Free' | 'Random Reset';
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  submittedBy: string; // User ID or name
  submissionDate: Date;
  processedDate?: Date;
  metadata?: {
    title?: string;
    artist?: string;
    duration?: number;
    artwork?: string;
    [key: string]: any; // Allow other metadata fields
  };
  submission_message?: string;
}

const SubmissionSchema: Schema = new Schema({
  url: { type: String, required: true },
  platform: { type: String, enum: ['youtube', 'spotify', 'soundcloud', 'bandcamp', 'local'], required: true },
  submissionType: { type: String, enum: ['VIP', 'Skip', 'GA', 'Free', 'Random Reset'], required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'processed'], default: 'pending' },
  submittedBy: { type: String, required: true },
  submissionDate: { type: Date, default: Date.now },
  processedDate: { type: Date },
  metadata: { type: Object },
  submission_message: { type: String },
});

export default mongoose.models.Submission || mongoose.model<ISubmission>('Submission', SubmissionSchema);
