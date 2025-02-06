import mongoose, { Document, Schema, Model } from "mongoose";
import { IPermission } from "./permission.model";
import { IRole } from "./role.model";

export interface ISubAdmin extends Document {
  username?: string;
  firstName: string;
  lastName: string;
  otherName?: string;
  email: string;
  phone?: string;
  organizationId: mongoose.Schema.Types.ObjectId;
  units?: mongoose.Schema.Types.ObjectId[];
  role: string;
  specialRole?: string;
  password: string;
  batch?: string;
  userType?: string;
  yearsOfExperience?: number;
  highestEducationLevel?: string;
  gender?: string;
  dateOfBirth?: string;
  image?: string;
  country?: string;
  address?: string;
  city?: string;
  LGA?: string;
  state?: string;
  officeAddress?: string;
  officeCity?: string;
  officeLGA?: string;
  officeState?: string;
  employerName?: string;
  permissions?: mongoose.Types.ObjectId[] | IPermission[];
  roles?: mongoose.Types.ObjectId[] | IRole[];
}

const SubAdminSchema: Schema<ISubAdmin> = new Schema({
  username: { type: String, unique: false },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  otherName: { type: String, default: null },
  email: { type: String, required: true, unique: true },
  phone: { type: String, sparse: true },
  units: [
    { type: mongoose.Schema.Types.ObjectId, sparse: true, ref: "Group" },
  ],
  organizationId: { type: mongoose.Schema.Types.ObjectId, default: null, required: true },
  role: { type: String, default: "subAdmin", required: true },
  password: { type: String, required: true },
  batch: { type: String },
  userType: { type: String, default: "learner" },
  yearsOfExperience: { type: Number, default: null },
  highestEducationLevel: { type: String, default: null },
  gender: { type: String, default: null },
  dateOfBirth: { type: String, default: null },
  image: { type: String, default: null },
  country: { type: String, default: null },
  address: { type: String, default: null },
  city: { type: String, default: null },
  LGA: { type: String, default: null },
  state: { type: String, default: null },
  officeAddress: { type: String, default: null },
  officeCity: { type: String, default: null },
  officeLGA: { type: String, default: null },
  officeState: { type: String, default: null },
  employerName: { type: String, default: null },
  permissions: [{ type: Schema.Types.ObjectId, ref: "Permission" }],
  roles: [{ type: Schema.Types.ObjectId, ref: "Role" }]
}, {
  timestamps: true,
});

const SubAdmin: Model<ISubAdmin> = mongoose.model<ISubAdmin>(
  "SubAdmin",
  SubAdminSchema
);

export default SubAdmin;
