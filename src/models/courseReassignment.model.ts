import mongoose, { Schema, model, Document } from "mongoose";

export interface ICourseReassignment extends Document {
  code?: string;
  courseId: Schema.Types.ObjectId;
  title: string;
  duration?: string;
  startDate?: Date;
  endDate?: Date;
  cost?: string | number;
  tutorId?: Schema.Types.ObjectId;
  learnerIds?: { userId: mongoose.Types.ObjectId; progress: number }[];
  assessments?: mongoose.Types.ObjectId[];
}

const CourseReassignmentSchema = new Schema<ICourseReassignment>({
  code: {type: String, required: true, unique: true},
  courseId: { type: Schema.Types.ObjectId, required: true, ref: "Course" },
  title: { type: String },
  duration: {type: String },
  startDate: { type: Date, required: false },
  endDate: { type: Date, required: false },
  cost: { type: Number || String, required: false },
  tutorId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  learnerIds: [
    {
      userId: { type: Schema.Types.ObjectId, ref: 'User' },
      progress: { type: Number, default: 0 }, 
    },
  ],
  assessments: [{ type: Schema.Types.ObjectId, ref: 'Assessment' }]
})

const Course = model<ICourseReassignment>("ReassignedCourse", CourseReassignmentSchema)

export default Course