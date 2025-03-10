import mongoose, { Document, Model, Schema } from "mongoose";

export interface ISuperAdmin extends Document {
  username?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: string;
  password: string;
  resetPasswordToken: string;
  resetPasswordExpires: Date;
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
      default: "superAdmin",
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  {
    timestamps: true,
  }
);

const SuperAdmin: Model<ISuperAdmin> = mongoose.model<ISuperAdmin>(
  "SuperAdmin",
  SuperAdminSchema
);

export default SuperAdmin;
