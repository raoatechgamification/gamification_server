import mongoose, { Document, Model, Schema } from "mongoose";
import { ICourse } from "../models/course.model";

export interface IOngoingProgram {
  course: ICourse; // Course details
  status?: string; // Optional properties if required
}

const OngoingProgramSchema = new Schema<IOngoingProgram>({
  course: { type: Object, required: true },
  status: { type: String }, // Optional properties if needed
});

export interface IAssignedProgram {
  _id: Schema.Types.ObjectId;
  courseId: Schema.Types.ObjectId;
  dueDate: Date;
  status: "paid" | "pending" | "unpaid" | "free";
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
  groups?: mongoose.Types.ObjectId[];
  subGroups?: mongoose.Types.ObjectId[];
  organizationId?: mongoose.Schema.Types.ObjectId;
  purchasedCourses?: mongoose.Schema.Types.ObjectId[];
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
  assignedPrograms?: IAssignedProgram[];
  ongoingPrograms?: { course: ICourse }[];
  completedPrograms?: { course: ICourse }[];
  unattemptedPrograms?: {
    course: ICourse;
    status: "paid" | "pending" | "unpaid" | "free";
  }[];
  certificates?: {
    courseId: mongoose.Types.ObjectId;
    courseName: string;
    certificateId: mongoose.Types.ObjectId;
  }[];
  createdAt: Date;
  updatedAt: Date;
  lessonCompletionStatus?: {
    [courseId: string]: {
      [lessonId: string]: number;
    };
  };
  contactPersonPlaceOfEmployment?: string;
  nameOfContactPerson?: string;
  contactEmail?: string;
  contactPersonPhoneNumber?: string;
  purchasedPrograms?: mongoose.Schema.Types.ObjectId[];
}

const AssignedProgramSchema = new Schema<IAssignedProgram>(
  {
    _id: { type: Schema.Types.ObjectId, auto: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    dueDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["paid", "pending", "unpaid", "free"],
      required: true,
    },
    amount: { type: Number, required: true },
  },
  { _id: false }
);

const UserSchema: Schema<IUser> = new Schema(
  {
    username: { type: String, unique: false },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    otherName: { type: String, default: null },
    email: { type: String, required: true, unique: true },
    phone: { type: String, sparse: true },
    userId: { type: String, default: null },
    groups: [
      { type: mongoose.Schema.Types.ObjectId, sparse: true, ref: "Group" },
    ],
    subGroups: [{ type: mongoose.Schema.Types.ObjectId }],
    organizationId: { type: mongoose.Schema.Types.ObjectId, default: null },
    role: { type: String, default: "user", required: true },
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
    contactPersonPlaceOfEmployment: { type: String, default: null },
    nameOfContactPerson: { type: String, default: null },
    contactEmail: { type: String, default: null },
    contactPersonPhoneNumber: { type: String, default: null },
    purchasedCourses: [{ type: mongoose.Schema.Types.ObjectId, default: [] }],
    assignedPrograms: {
      type: [AssignedProgramSchema],
      default: [],
    },
    ongoingPrograms: [
      {
        course: {
          _id: { type: mongoose.Types.ObjectId, ref: "Course", required: true },
          title: { type: String, required: true },
          objective: { type: String },
          certificate: { type: mongoose.Types.ObjectId, ref: "Certificate" },
          tutorId: { type: mongoose.Types.ObjectId, ref: "Tutor" },
          organizationId: {
            type: mongoose.Types.ObjectId,
            ref: "Organization",
          },
          lessonFormat: { type: String },
          lessons: { type: Array, default: [] },
          assignedLearnersIds: { type: [mongoose.Types.ObjectId], default: [] },
          assessments: { type: [mongoose.Types.ObjectId], default: [] },
          cost: { type: Number },
          duration: { type: String },
          courseCode: { type: String },
          courseImage: { type: Array, default: [] },
          curriculum: { type: Array, default: [] },
          learnerIds: { type: [mongoose.Types.ObjectId], default: [] },
          __v: { type: Number },
        },
        status: {
          type: String,
          enum: ["paid", "pending", "unpaid", "free"],
          required: true,
        },
      },
    ],
    completedPrograms: [
      {
        course: {
          _id: { type: mongoose.Types.ObjectId, ref: "Course", required: true },
          title: { type: String, required: true },
          objective: { type: String },
          certificate: { type: mongoose.Types.ObjectId, ref: "Certificate" },
          tutorId: { type: mongoose.Types.ObjectId, ref: "Tutor" },
          organizationId: {
            type: mongoose.Types.ObjectId,
            ref: "Organization",
          },
          lessonFormat: { type: String },
          lessons: { type: Array, default: [] },
          assignedLearnersIds: { type: [mongoose.Types.ObjectId], default: [] },
          assessments: { type: [mongoose.Types.ObjectId], default: [] },
          cost: { type: Number },
          duration: { type: String },
          courseCode: { type: String },
          courseImage: { type: Array, default: [] },
          curriculum: { type: Array, default: [] },
          learnerIds: { type: [mongoose.Types.ObjectId], default: [] },
          __v: { type: Number },
        },
        status: {
          type: String,
          enum: ["paid", "pending", "unpaid", "free"],
          required: true,
        },
      },
    ],
    unattemptedPrograms: [
      {
        course: {
          _id: { type: mongoose.Types.ObjectId, ref: "Course", required: true },
          title: { type: String, required: true },
          objective: { type: String },
          certificate: { type: mongoose.Types.ObjectId, ref: "Certificate" },
          tutorId: { type: mongoose.Types.ObjectId, ref: "Tutor" },
          organizationId: {
            type: mongoose.Types.ObjectId,
            ref: "Organization",
          },
          lessonFormat: { type: String },
          lessons: { type: Array, default: [] },
          assignedLearnersIds: { type: [mongoose.Types.ObjectId], default: [] },
          assessments: { type: [mongoose.Types.ObjectId], default: [] },
          cost: { type: Number },
          duration: { type: String },
          courseCode: { type: String },
          courseImage: { type: Array, default: [] },
          curriculum: { type: Array, default: [] },
          learnerIds: { type: [mongoose.Types.ObjectId], default: [] },
          __v: { type: Number },
        },
        status: {
          type: String,
          enum: ["paid", "pending", "unpaid", "free"],
          required: true,
        },
      },
    ],
    certificates: [
      {
        courseId: { type: mongoose.Types.ObjectId, ref: "Course" },
        courseName: { type: String },
        certificateId: { type: mongoose.Types.ObjectId, ref: "Certifcate" },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);

export default User;
export type UserDocument = IUser;
