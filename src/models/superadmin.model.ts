import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISuperAdmin extends Document {
  username?: string; 
  email: string; 
  firstName?: string; 
  lastName?: string;
  phone?: string; 
  role: string; 
  password: string; 
}

const SuperAdminSchema: Schema<ISuperAdmin> = new Schema(
  {
    username: {
      type: String,
      default: null, 
    },
    email: {
      type: String,
      required: true, 
      unique: true, 
    },
    firstName: {
      type: String,
      default: null, 
    },
    lastName: {
      type: String,
      default: null, 
    },
    phone: {
      type: String,
    },
    role: {
      type: String,
      default: 'superAdmin', 
      required: true, 
    },
    password: {
      type: String,
      required: true, 
    },
  },
  {
    timestamps: true, 
  }
);

const SuperAdmin: Model<ISuperAdmin> = mongoose.model<ISuperAdmin>('SuperAdmin', SuperAdminSchema);

export default SuperAdmin;
