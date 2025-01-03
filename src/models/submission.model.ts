import mongoose, { Document, Schema } from 'mongoose';

export interface PopulatedAssessment {
  _id: string;
  highestAttainableScore: number;
}

export interface PopulatedLearner {
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
  courseId: string;
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
  learnerId: mongoose.Types.ObjectId | PopulatedLearner;
  courseId: mongoose.Types.ObjectId;
  assessmentId: mongoose.Types.ObjectId | PopulatedAssessment;
  submittedFile?: string;
  comments?: string; 
  gradedAnswers?: SubmissionAnswerInterface[];
  score?: number; 
  maxObtainableMarks?: number;
  percentageScore?: number;
  status?: 'Submitted' | 'Graded';
  passOrFail?: 'Pass' | 'Fail',
  createdAt: Date
}

const submissionSchema = new Schema<ISubmission>(
  {
    learnerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    assessmentId: { type: String, required: true,ref: "ObjectiveAssessment", },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true }, 
    answer: [
      {
        questionId: { type: Schema.Types.ObjectId, required: true },
        answer: Schema.Types.Mixed, 
        isCorrect: { type: Boolean },
      },
    ],  
    score: { type: Number, min: 0 },
    status: { type: String, enum: ['Ungraded', 'Graded'], default: 'Ungraded' },
    gradedAnswers: [
      {
        questionId: { type: Schema.Types.ObjectId, required: true },
        answer: Schema.Types.Mixed,
        isCorrect: { type: Boolean },
      },
    ],
    submittedFile: { type: String },
    comments: { type: String },
    maxObtainableMarks: { type: Number, min: 0},
    percentageScore: { type: Number, min: 0, max: 100 },
    passOrFail: { type: String, enum: ["Pass", "Fail"], default: "Fail" },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ISubmission>('Submission', submissionSchema);
