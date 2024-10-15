import mongoose, { Document, Schema } from 'mongoose';

export interface CourseAccessDocument extends Document {
  userId: string;
  courseId: string;
  hasAccess: boolean;
}

const courseAccessSchema = new Schema<CourseAccessDocument>(
  {
    userId: { type: String, required: true },
    courseId: { type: String, required: true },
    hasAccess: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<CourseAccessDocument>('CourseAccess', courseAccessSchema);
