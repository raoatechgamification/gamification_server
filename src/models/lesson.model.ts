import mongoose, { Document, Schema } from 'mongoose';

export interface CompletionDetails {
  userId: mongoose.Types.ObjectId;
  percentage: number;
}

export interface LessonDocument extends Document {
  courseId: mongoose.Types.ObjectId;
  title: string;
  objectives: string;
  link?: string;
  files?: string[];
  completionDetails: CompletionDetails[];
}

const lessonSchema = new Schema<LessonDocument>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true },
    objectives: { type: String, required: true },
    link: { type: String }, 
    files: { type: [String] }, 
    completionDetails: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        percentage: { type: Number, default: 0 }, // Completion percentage for the lesson
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<LessonDocument>('lesson', lessonSchema);
