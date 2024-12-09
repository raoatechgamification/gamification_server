import mongoose, { Schema, Document, Model } from "mongoose";
import { ICourse } from "../models/course.model";

export interface IAssignedProgram {
  _id: Schema.Types.ObjectId; 
  courseId: Schema.Types.ObjectId;
  dueDate: Date;
  status: "paid" | "pending" | "unpaid"; 
  amount: number;
}

export interface IUser extends Document {
  username?: string;
  firstName: string;
  lastName: string;
  otherName?: string;
  email: string;
  phone?: string;
  userId?: string;
  groups?: mongoose.Schema.Types.ObjectId[];
  organizationId?: mongoose.Schema.Types.ObjectId;
  role: string;
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
  assignedPrograms?: IAssignedProgram[],
  ongoingPrograms?: ICourse[];
  completedPrograms?: ICourse[];
  createdAt: Date; 
  updatedAt: Date; 
}

const AssignedProgramSchema = new Schema<IAssignedProgram>(
  {
    _id: { type: Schema.Types.ObjectId, auto: true }, 
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    dueDate: { type: Date, required: true },
    status: { 
      type: String, 
      enum: ["paid", "pending", "unpaid"], 
      required: true 
    },
    amount: { type: Number, required: true },
  },
  { _id: false } 
);

const UserSchema: Schema<IUser> = new Schema(
  {
    username: { type: String, unique: false },
    firstName: { type: String, required: true, },
    lastName: { type: String, required: true, },
    otherName: { type: String, default: null },
    email: { type: String, required: true, unique: true, },
    phone: { type: String, default: null, unique: true },
    userId: { type: String, default: null },
    groups: [{ type: mongoose.Schema.Types.ObjectId }],
    organizationId: { type: mongoose.Schema.Types.ObjectId, default: null, },
    role: { type: String, default: "user", required: true, },
    password: { type: String, required: true, },
    batch: { type: String },
    userType: { type: String, default: "learner" },
    yearsOfExperience: { type: Number, default: null, },
    highestEducationLevel: { type: String, default: null, },
    gender: { type: String, default: null, },
    dateOfBirth: { type: String, default: null, },
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
    assignedPrograms: {
      type: [AssignedProgramSchema], 
      default: [],
    },
    ongoingPrograms: { type: [Object], default: null, },
    completedPrograms: { type: [Object], default: null, }
  }, {
    timestamps: true,
  }
);

const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);

export default User;
export type UserDocument = IUser;
