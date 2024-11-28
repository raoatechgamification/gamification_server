import mongoose, { Schema, model, Document } from 'mongoose';

export interface ICourse extends Document {
  code: string;
  title?: string;
  description?: string,
  requirement?: string,
  topContent?: boolean,
  objective?: string;
  // price?: number;
  tutorId?: Schema.Types.ObjectId
  organizationId?: string;
  lessonFormat?: string;
  instructorId: string;
  // learnerIds?: string[];
  lessons: mongoose.Types.ObjectId[];
  learnerIds?: { userId: mongoose.Types.ObjectId; progress: number }[];
  assessments?: mongoose.Types.ObjectId[]
  duration?: string;
  courseCode?: string;
  courseLevel?: string;
  startDate?: Date;
  endDate?: Date;
  numberOfHoursPerDay?: number;
  numberOfDaysPerWeek?: number;
  cost?: number | string;
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
  passMark: number;
  maximumNumberOfTrials?: number
}

const CourseSchema = new Schema<ICourse>({
  code: { type: String, required: true, unique: true },
  title: { type: String, required: false },
  description: { type: String, required: false },
  requirement: { type: String, required: false },
  topContent: { type: Boolean, required: false },
  objective: { type: String, required: false },
  // price: { type: Number, required: false },
  instructorId: { type: String, required: false },

  tutorId: { type: Schema.Types.ObjectId },
  organizationId: { type: String, required: false },
  lessonFormat: { type: String, required: false },
  // learnerIds: [{ type: String }],
  lessons: [{ type: Schema.Types.ObjectId, ref: 'Lesson' }],
  learnerIds: [
    {
      userId: { type: Schema.Types.ObjectId, ref: 'User' },
      progress: { type: Number, default: 0 }, // Completion percentage for the course
    },
  ],
  assessments: [{ type: Schema.Types.ObjectId, ref: 'Assessment' }],
  duration: { type: String, required: false },
  courseCode: { type: String, required: false },
  courseLevel: { type: String, required: false },
  startDate: { type: Date, required: false },
  endDate: { type: Date, required: false },
  numberOfHoursPerDay: { type: Number, required: false },
  numberOfDaysPerWeek: { type: Number, required: false },
  cost: { type: Number || String, required: false },
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
  courseImage: [{type: String}],
  curriculum: [{ type: String }],
  teachingMethod: { type: String },
  passMark: {type: Number, required: false},
  maximumNumberOfTrials: {type: Number, required: false}
});

const Course = model<ICourse>('Course', CourseSchema);
export default Course