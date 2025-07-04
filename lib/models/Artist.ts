import mongoose, { Schema, Document } from 'mongoose';

export interface IArtist extends Document {
  clerkUserId: string; // Link to Clerk user ID
  name: string;
  bio?: string;
  songs: mongoose.Types.ObjectId[];
  profileImage?: string;
  spotifyId?: string;
  youtubeChannelId?: string;
  soundcloudId?: string;
  appleMusicId?: string;
  genres?: string[];
  followers?: number;
  socialLink?: string;
  embedLinks?: string[];
  currentProject?: string;
  latestAlbum?: string;
  newsFeed?: string;
}

const ArtistSchema: Schema = new Schema({
  clerkUserId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  bio: { type: String },
  songs: [{ type: Schema.Types.ObjectId, ref: 'Song' }],
  profileImage: { type: String },
  spotifyId: { type: String },
  youtubeChannelId: { type: String },
  soundcloudId: { type: String },
  appleMusicId: { type: String },
  genres: { type: [String] },
  followers: { type: Number },
  socialLink: { type: String },
  embedLinks: { type: [String] },
  currentProject: { type: String },
  latestAlbum: { type: String },
  newsFeed: { type: String },
});

export default mongoose.models.Artist || mongoose.model<IArtist>('Artist', ArtistSchema);
