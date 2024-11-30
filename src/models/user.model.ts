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
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  organizationId?: mongoose.Schema.Types.ObjectId;
  role: string;
  password: string;
  batch?: string;
  userType?: string;
  yearsOfExperience?: number;
  highestEducationLevel?: string;
  gender?: string;
  dateOfBirth?: string;
  assignedPrograms?: IAssignedProgram[],
  ongoingPrograms?: ICourse[];
  completedPrograms?: ICourse[];
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
    firstName: { type: String, default: null, },
    lastName: { type: String, default: null, },
    email: { type: String, required: true, unique: true, },
    phone: { type: String, default: null, },
    organizationId: { type: mongoose.Schema.Types.ObjectId, default: null, },
    role: { type: String, default: "user", required: true, },
    password: { type: String, required: true, },
    batch: { type: String },
    userType: { type: String, default: "learner" },
    yearsOfExperience: { type: Number, default: null, },
    highestEducationLevel: { type: String, default: null, },
    gender: { type: String, default: null, },
    dateOfBirth: { type: String, default: null, },
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
