import mongoose, { Document, Schema } from 'mongoose';

export interface CourseDocument extends Document {
  title: string;
  objective: string;
  price: number;
  instructorId: string;
  duration: string;
  lessonFormat: string;
}

const courseSchema = new Schema<CourseDocument>(
  {
    title: { type: String, required: true },
    objective: { type: String, required: true },
    price: { type: Number, required: true }, 
    instructorId: { type: String, required: true }, 
    duration: { type: String, required: true }, 
    lessonFormat: { type: String, required: true }, 
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<CourseDocument>('Course', courseSchema);