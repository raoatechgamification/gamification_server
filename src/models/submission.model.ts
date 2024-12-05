import mongoose, { Document, Schema } from 'mongoose';

interface PopulatedAssessment {
  highestAttainableScore: number;
}

interface PopulatedLearner {
  _id: string; 
  firstName: string;
  lastName: string;
}

export interface PopulatedSubmission {
  learnerId: PopulatedLearner;
  assessmentId: PopulatedAssessment; // The populated type
  score: number;
  passOrFail: string;
}

export interface SubmissionAnswerInterface {
  questionId: string;
  answer: string | boolean | number;
  isCorrect?: boolean; 
}

export interface SubmissionInterface {
  _id: string;
  learnerId: string;
  assessmentId: string;
  answer: SubmissionAnswerInterface[]; 
  score?: number;
  status: string;
  gradedAnswers?: SubmissionAnswerInterface[];
}

export interface ISubmission extends Document {
  answer: {
    questionId: Schema.Types.ObjectId;
    answer: Schema.Types.Mixed;
    isCorrect?: boolean;
  }[];
  learnerId: Schema.Types.ObjectId;
  courseId: Schema.Types.ObjectId;
  assessmentId: Schema.Types.ObjectId;
  submittedFile?: string;
  comments?: string; 
  gradedAnswers?: SubmissionAnswerInterface[];
  score?: number; 
  percentageScore?: number;
  status?: 'Submitted' | 'Graded';
  passOrFail?: 'Pass' | 'Fail'
}

const submissionSchema = new Schema<ISubmission>(
  {
    learnerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Assessment", required: true }, 
    assessmentId: { type: String, required: true },
    answer: [
      {
        questionId: { type: String, required: true },
        answer: { type: Schema.Types.Mixed, required: true }, 
        isCorrect: { type: Boolean },
      },
    ],  
    submittedFile: { type: String },
    comments: { type: String },
    gradedAnswers: [
      {
        questionId: { type: String, required: true },
        answer: { type: Schema.Types.Mixed, required: true },
        isCorrect: { type: Boolean },
      },
    ],
    score: { type: Number, min: 0 },
    percentageScore: { type: Number, min: 0, max: 100 },
    status: { type: String, enum: ['Submitted', 'Graded'], default: 'Submitted' },
    passOrFail: { type: String, enum: ["Pass", "Fail"], default: "Fail" },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ISubmission>('Submission', submissionSchema);
