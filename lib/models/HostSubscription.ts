import mongoose, { Schema, Document } from 'mongoose';

export interface IHostSubscription extends Document {
  host: mongoose.Types.ObjectId; // Reference to the Host
  tier: 'Free' | 'Basic' | 'Premium'; // Example tiers
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  paymentMethod: 'Square' | 'PayPal' | 'Web3';
  paymentDetails: Record<string, any>; // Store relevant payment gateway details
  clerkUserId: string; // Link to Clerk user ID
}

const HostSubscriptionSchema: Schema = new Schema({
  host: { type: Schema.Types.ObjectId, ref: 'Host', required: true },
  tier: { type: String, enum: ['Free', 'Basic', 'Premium'], required: true },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  isActive: { type: Boolean, default: true },
  paymentMethod: { type: String, enum: ['Square', 'PayPal', 'Web3'], required: true },
  paymentDetails: { type: Object, default: {} },
  clerkUserId: { type: String, required: true, unique: true },
});

export default mongoose.models.HostSubscription || mongoose.model<IHostSubscription>('HostSubscription', HostSubscriptionSchema);
