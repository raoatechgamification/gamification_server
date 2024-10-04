import mongoose, { Document, Schema } from 'mongoose';

export interface OrganizationDocument extends Document {
  name: string;
  email: string;
  phone: string;
  preferredUrl: string;
  referral: string;
  referralSource: string;
  password: string; 
  role: string; 
  createdAt: Date; 
  updatedAt: Date; 
}

const organizationSchema = new Schema<OrganizationDocument>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true }, 
  phone: { type: String },
  preferredUrl: { type: String },
  referral: { type: String },
  referralSource: { type: String },
  password: { type: String, required: true }, 
  role: { type: String, default: 'organization', required: true }, 
}, {
  timestamps: true, 
});

export default mongoose.model<OrganizationDocument>('Organization', organizationSchema);
