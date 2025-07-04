import mongoose, { Schema, Document } from 'mongoose';
import { IPlaylist } from './Playlist'; // Assuming Playlist model will be created

export interface IShow extends Document {
  date: Date;
  playlist: mongoose.Types.ObjectId | IPlaylist;
  host?: string;
  theme?: string;
}

const ShowSchema: Schema = new Schema({
  date: { type: Date, required: true, default: Date.now },
  playlist: { type: Schema.Types.ObjectId, ref: 'Playlist', required: true },
  host: { type: String },
  theme: { type: String },
});

export default mongoose.models.Show || mongoose.model<IShow>('Show', ShowSchema);
