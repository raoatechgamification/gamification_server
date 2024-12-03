import mongoose, { Document, Schema } from 'mongoose';

export interface SubmissionAnswerInterface {
  questionId: string;
  answer: string;
  isCorrect?: boolean; // Optional field for graded answers
}8888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888

export interface SubmissionInterface {
  _id: string;
  learnerId: string;
  assessmentId: string;
  answer: SubmissionAnswerInterface[]; // Ensure 'answer' is an array
  score?: number;
  status: string;
  gradedAnswers?: SubmissionAnswerInterface[];
}

export interface SubmissionDocument extends Document {
  answer: string;
  learnerId: string;
  assessmentId: string;
  submittedFile?: string;
  comments?: string; 
  gradedAnswers?: { questionId: string; answer: string; isCorrect: boolean }[];
  score?: number; 
  status?: 'Submitted' | 'Graded';
}

const submissionSchema = new Schema<SubmissionDocument>(
  {
    answer: { type: String, required: true },
    learnerId: { type: String, required: true },
    assessmentId: { type: String, required: true }, 
    submittedFile: { type: String }, 
    comments: { type: String }, 
    gradedAnswers: [
      {
        questionId: { type: String },
        answer: { type: String },
        isCorrect: { type: Boolean },
      },
    ],
    score: { type: Number, min: 0 }, 
    status: { type: String, enum: ['Submitted', 'Graded'], default: 'Submitted' },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<SubmissionDocument>('Submission', submissionSchema);
