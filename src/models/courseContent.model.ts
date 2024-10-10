import mongoose, { Document, Schema } from 'mongoose';

export interface CourseContentDocument extends Document {
  courseId: string;
  title: string;
  objectives: string;
  link?: string;
  files?: string[];
}

const courseContentSchema = new Schema<CourseContentDocument>(
  {
    courseId: { type: String, required: true },
    title: { type: String, required: true },
    objectives: { type: String, required: true },
    link: { type: String }, 
    files: { type: [String] }, 
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<CourseContentDocument>('CourseContent', courseContentSchema);
