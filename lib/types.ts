import mongoose from 'mongoose';

// From lib/url-utils.ts
export interface ExtractedMetadata {
  title?: string;
  artist?: string;
  artwork?: string;
  duration?: number;
  is_video?: boolean;
}

export type Platform = 'youtube' | 'spotify' | 'soundcloud' | 'bandcamp' | 'local' | 'unknown';

// Consolidated SongData (from admin, library, artist pages)
export interface SongData {
  _id: string;
  title: string;
  artist: string | { _id: string; name: string }; // Can be string or populated Artist object
  url: string;
  platform: Platform;
  artwork: string;
  duration: number;
  submissionType?: 'VIP' | 'Skip' | 'GA' | 'Free' | 'Random Reset'; // From Submission
  submission_message?: string; // From Submission
  is_video?: boolean;
  media_type?: Platform; // More specific media type
  hls_url?: string;
  cover_art_url?: string;
}

// Submission data (from admin page)
export interface SubmissionData {
  _id: string;
  url: string;
  submissionType: 'VIP' | 'Skip' | 'GA' | 'Free' | 'Random Reset';
  submission_message?: string;
  status: 'pending' | 'approved' | 'rejected';
  metadata?: ExtractedMetadata;
  clerkUserId?: string;
  created_at?: string;
}

// Consolidated PlaylistItemData (from admin, library pages)
export interface PlaylistItemData {
  _id: string;
  song: SongData; // Populated Song data
  position: number;
  status: 'queued' | 'now_playing' | 'played';
  tier: 'VIP' | 'Skip' | 'GA' | 'Free' | 'Random Reset';
  rating?: number; // Host rating (e.g., 0-100)
  submission_id?: string; // Reference to the original submission if applicable
  guestRatings?: { userId: string; rating: number; }[]; // Guest ratings from listeners
}

// Consolidated PlaylistData (from library page)
export interface PlaylistData {
  _id: string;
  name: string;
  items: PlaylistItemData[];
  is_show_archive: boolean;
  is_locked?: boolean; // To lock the top 10 tracks in the queue
  created_at: string;
  finalized_at?: string;
}

// Consolidated ArtistData (from library, artist pages)
export interface ArtistData {
  _id: string;
  clerkUserId?: string; // Added from Host model for consistency if artist also has Clerk ID
  name: string;
  bio?: string;
  profileImage?: string;
  socialLink?: string;
  embedLinks?: string[];
  currentProject?: string;
  latestAlbum?: string;
  newsFeed?: string;
  songs?: SongData[]; // Populated songs by this artist
  shows?: { showId: string; date: string; playlistName: string; }[]; // Placeholder for show appearances
  awards?: string[]; // Placeholder for awards
  spotifyId?: string;
  youtubeChannelId?: string;
  soundcloudId?: string;
  appleMusicId?: string;
  genres?: string[];
  followers?: number;
}

// Consolidated HostSubscriptionData (from host-dashboard)
export interface HostSubscriptionData {
  tier: 'Free' | 'Basic' | 'Premium'; // Example tiers
  startDate: string;
  endDate?: string;
  isActive: boolean;
  paymentMethod: string;
  paymentDetails: Record<string, any>; // Store relevant payment gateway details
  clerkUserId: string; // Link to Clerk user ID
}

// Consolidated HostData (from host-dashboard, host pages)
export interface HostData {
  _id: string;
  clerkUserId: string; // Link to Clerk user ID
  name: string;
  email: string;
  currentSubscription: HostSubscriptionData;
  configuredPaymentGateways: { // Flexible payment gateway options for hosts
    paypal?: { clientId: string; clientSecret: string; };
    customLink?: string;
    stripe?: { publishableKey: string; secretKey: string; };
  };
  profileImage?: string;
  bio?: string;
  socialLink?: string;
  embedLinks?: string[];
  currentProject?: string;
  latestShow?: string;
  newsFeed?: string;
}
