import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IOrganization extends Document {
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string;
  preferredUrl?: string;
  referral?: string;
  referralSource?: string;
  industry?: string;
  password: string; 
  role: string; 
  createdAt: Date; 
  updatedAt: Date; 
}
export interface IContact {
  phoneNumber: string;
  email: string;
  address: string;
}

export interface IOrganization extends Document {
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string;
  preferredUrl?: string;
  referral?: string;
  referralSource?: string;
  industry?: string;
  password: string; 
  role: string; 
  createdAt: Date; 
  updatedAt: Date; 
  contact?: IContact;
  organisationLogo?: string;
}
const OrganizationSchema: Schema<IOrganization> = new Schema({
  name: { type: String, required: true },
  firstName: { type: String },
  lastName: { type: String},
  email: { type: String, required: true, unique: true }, 
  phone: { type: String },
  preferredUrl: { type: String },
  referral: { type: String },
  referralSource: { type: String },
  industry: { type: String },
  organisationLogo: {type: String},
  contact: {
    phoneNumber: { type: String },
    email: { type: String },
    address: { type: String }
  },
  password: { type: String, required: true }, 
  role: { type: String, default: 'admin', required: true }, 
}, {
  timestamps: true, 
});

const Organization: Model<IOrganization> = mongoose.model<IOrganization>("Organization", OrganizationSchema);

export default Organization
export type OrganizationDocument = IOrganization
