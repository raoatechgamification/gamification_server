import mongoose, { Document, Schema } from 'mongoose';

export interface CompletionDetails {
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  percentage: number;
}

export interface LessonDocument extends Document {
  courseIds?: mongoose.Types.ObjectId[];
  organizationId:  mongoose.Types.ObjectId;
  title: string;
  objectives: string;
  link?: string;
  files?: string[];
  completionDetails: CompletionDetails[];
}

const lessonSchema = new Schema<LessonDocument>(
  {
    courseIds: [{ type: Schema.Types.ObjectId, ref: 'Course'}],
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    title: { type: String, required: true },
    objectives: { type: String, required: true },
    link: { type: String }, 
    files: { type: [String] }, 
    completionDetails: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        courseId: { type: Schema.Types.ObjectId, ref: "Course" },
        percentage: { type: Number, default: 0 }, 
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<LessonDocument>('Lesson', lessonSchema);
