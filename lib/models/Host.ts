import mongoose, { Schema, Document } from 'mongoose';

export interface IHost extends Document {
  clerkUserId: string; // Link to Clerk user ID
  name: string;
  email: string;
  currentSubscription: mongoose.Types.ObjectId; // Reference to HostSubscription
  configuredPaymentGateways: { // Flexible payment gateway options for hosts
    stripe?: { publishableKey: string; secretKey: string; };
    paypal?: { clientId: string; clientSecret: string; };
    // Add other payment gateways as needed
  };
  profileImage?: string;
  bio?: string;
  socialLink?: string;
  embedLinks?: string[]; // Array of URLs for video/audio embeds
  currentProject?: string;
  latestShow?: string;
  newsFeed?: string; // Single news update
  // Other host-specific settings
}

const HostSchema: Schema = new Schema({
  clerkUserId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  currentSubscription: { type: Schema.Types.ObjectId, ref: 'HostSubscription' },
  configuredPaymentGateways: {
    type: Object,
    default: {},
  },
  profileImage: { type: String },
  bio: { type: String },
  socialLink: { type: String },
  embedLinks: { type: [String], default: [] },
  currentProject: { type: String },
  latestShow: { type: String },
  newsFeed: { type: String },
});

export default mongoose.models.Host || mongoose.model<IHost>('Host', HostSchema);
