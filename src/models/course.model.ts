import mongoose, { Schema, model, Document } from "mongoose";

export interface ICourse extends Document {
  title: string;
  description?: string;
  requirement?: string;
  topContent?: boolean;
  objective?: string;
  organizationId?: string;
  lessonFormat?: string;
  instructor: mongoose.Types.ObjectId | string; // Union handled in TypeScript only
  lessons?: mongoose.Types.ObjectId[];
  learnerIds?: { userId: mongoose.Types.ObjectId; progress: number }[];
  assignedLearnerIds?: { userId: mongoose.Types.ObjectId }[];
  assessments?: mongoose.Types.ObjectId[];
  certificate?: mongoose.Types.ObjectId;
  duration?: string;
  courseCode?: string;
  courseLevel?: string;
  startDate?: Date;
  endDate?: Date;
  numberOfHoursPerDay?: number;
  numberOfDaysPerWeek?: number;
  cost?: number;
  promo?: string;
  promoCode?: string;
  promoValue?: number;
  platformCharge?: number;
  actualCost?: number;
  sharing?: string;
  sharingValue?: number;
  visibilityStartDate?: Date;
  visibilityEndDate?: Date;
  visibilityStartTime?: string;
  visibilityEndTime?: string;
  courseImage: string[];
  curriculum?: string[];
  teachingMethod?: string;
  passMark?: number;
  maximumNumberOfTrials?: number;
}

const CourseSchema = new Schema<ICourse>({
  title: { type: String, required: true },
  description: { type: String },
  requirement: { type: String },
  topContent: { type: Boolean },
  objective: { type: String },
  organizationId: { type: String },
  lessonFormat: { type: String },
  // instructor: { type: Schema.Types.ObjectId, ref: 'User' },
  instructor: {
    type: Schema.Types.Mixed, // Accepts both ObjectId and String
    validate: {
      validator: (value: any) => {
        return (
          mongoose.Types.ObjectId.isValid(value) || typeof value === "string"
        );
      },
      message: "Instructor must be either a valid ObjectId or a string.",
    },
  },
  lessons: [{ type: Schema.Types.ObjectId, ref: "Lesson" }],
  learnerIds: [
    {
      userId: { type: Schema.Types.ObjectId, ref: "User" },
      progress: { type: Number, default: 0 },
    },
  ],
  assignedLearnerIds: [
    {
      userId: { type: Schema.Types.ObjectId, ref: "User" },
    },
  ],
  assessments: [{ type: Schema.Types.ObjectId, ref: "ObjectiveAssessment" }],
  certificate: { type: Schema.Types.ObjectId, ref: "Certificate" },
  duration: { type: String },
  courseCode: { type: String },
  courseLevel: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  numberOfHoursPerDay: { type: Number },
  numberOfDaysPerWeek: { type: Number },
  cost: { type: Number },
  promo: { type: String },
  promoCode: { type: String },
  promoValue: { type: Number },
  platformCharge: { type: Number },
  actualCost: { type: Number },
  sharing: { type: String },
  sharingValue: { type: Number },
  visibilityStartDate: { type: Date },
  visibilityEndDate: { type: Date },
  visibilityStartTime: { type: String },
  visibilityEndTime: { type: String },
  courseImage: [{ type: String }],
  curriculum: [{ type: String }],
  teachingMethod: { type: String },
  passMark: { type: Number },
  maximumNumberOfTrials: { type: Number },
});

const Course = model<ICourse>("Course", CourseSchema);
export default Course;
