import mongoose, { Document, Schema } from 'mongoose';

export interface SubmissionDocument extends Document {
  answerText: string;
  learnerId: string;
  assessmentId: string;
  submittedFile?: string;
  comments?: string; 
  score?: number; 
  status?: string;
}

const submissionSchema = new Schema<SubmissionDocument>(
  {
    answerText: { type: String, required: true },
    learnerId: { type: String, required: true },
    assessmentId: { type: String, required: true }, 
    submittedFile: { type: String }, 
    comments: { type: String }, 
    score: { type: Number, min: 0 }, 
    status: { type: String }
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<SubmissionDocument>('Submission', submissionSchema);
