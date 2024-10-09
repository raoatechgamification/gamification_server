import mongoose, { Document, Schema } from 'mongoose';

export interface OrganizationDocument extends Document {
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string;
  preferredUrl: string;
  referral: string;
  referralSource: string;
  industry?: string;
  password: string; 
  role: string; 
  createdAt: Date; 
  updatedAt: Date; 
}

const organizationSchema = new Schema<OrganizationDocument>({
  name: { type: String, required: true },
  firstName: { type: String },
  lastName: { type: String},
  email: { type: String, required: true, unique: true }, 
  phone: { type: String },
  preferredUrl: { type: String },
  referral: { type: String },
  referralSource: { type: String },
  industry: { type: String },
  password: { type: String, required: true }, 
  role: { type: String, default: 'admin', required: true }, 
}, {
  timestamps: true, 
});

export default mongoose.model<OrganizationDocument>('Organization', organizationSchema);
