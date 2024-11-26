import { Schema, model, Document } from 'mongoose';

export interface ICourse extends Document {
  title: string;
  description: string;
  requirement?: string;
  topContent?: string;
  objective?: string;
  price?: number;
  instructorId?: string;
  organisationId: string;
  lessonFormat?: string;
  learnerIds?: string[];
  duration: number;
  courseCode?: string;
  courseLevel?: string;
  startDate: Date;
  endDate: Date;
  numberOfHoursPerDay?: number;
  numberOfDaysPerWeek?: number;
  cost?: number;
  promo?: string;
  promoCode?: string;
  promoValue?: number;
  platformCharge?: number;
  actualCost: number;
  sharing?: string;
  sharingValue?: number;
  visibilityStartDate?: Date;
  visibilityEndDate?: Date;
  visibilityStartTime?: string;
  visibilityEndTime?: string;
  curriculum: string[];
  teachingMethod?: string;
  passMark?: number;
  maximumNumberOfTrials?: number
}

const CourseSchema = new Schema<ICourse>({
  title: { type: String, required: true, unique: true },
  description: { type: String, required: false },
  requirement: { type: String, required: false },
  topContent: { type: String, required: false },
  objective: { type: String, required: false },
  price: { type: Number, required: false },
  instructorId: { type: String, required: false },
  organisationId: { type: String, required: true },
  lessonFormat: { type: String, required: false },
  learnerIds: [{ type: String }],
  duration: { type: Number, required: true },
  courseCode: { type: String, required: false },
  courseLevel: { type: String, required: false },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  numberOfHoursPerDay: { type: Number, required: false },
  numberOfDaysPerWeek: { type: Number, required: false },
  cost: { type: Number, required: true },
  promo: { type: String },
  promoCode: { type: String },
  promoValue: { type: Number },
  platformCharge: { type: Number },
  actualCost: { type: Number, required:true },
  sharing: { type: String },
  sharingValue: { type: Number },
  visibilityStartDate: { type: Date },
  visibilityEndDate: { type: Date },
  visibilityStartTime: { type: String },
  visibilityEndTime: { type: String },
  curriculum: [{ type: String, required: true }],
  teachingMethod: { type: String, required:true },
  passMark: {type: Number, required: false},
  maximumNumberOfTrials: {type: Number, required: false}
});

const Course = model<ICourse>('Course', CourseSchema);
export default Course
