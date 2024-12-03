import mongoose, { Document, Schema } from 'mongoose';

export interface SubmissionAnswerInterface {
  questionId: string;
  answer: string | boolean | number;
  isCorrect?: boolean; // Optional field for graded answers
}

export interface SubmissionInterface {
  _id: string;
  learnerId: string;
  assessmentId: string;
  answer: SubmissionAnswerInterface[]; // Ensure 'answer' is an array
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
  status?: 'Submitted' | 'Graded';
}

const submissionSchema = new Schema<ISubmission>(
  {
    learnerId: { type: String, required: true },
    courseId: { type: String, required: true }, 
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
    status: { type: String, enum: ['Submitted', 'Graded'], default: 'Submitted' },
  },
  {
    timestamps: true,
  }
);

// const submissionSchema = new Schema<ISubmission>(
//   {
//     learnerId: { type: Schema.Types.ObjectId, required: true },
//     courseId: { type: Schema.Types.ObjectId, required: true },
//     assessmentId: { type: Schema.Types.ObjectId, required: true },
//     answer: [
//       {
//         questionId: { type: String, required: true },
//         answer: { type: Schema.Types.Mixed, required: true }, 
//         isCorrect: { type: Boolean },
//       },
//     ], 
//     submittedFile: { type: String }, 
//     comments: { type: String }, 
//     gradedAnswers: [
//       {
//         questionId: { type: String },
//         answer: { type: String },
//         isCorrect: { type: Boolean },
//       },
//     ],
//     score: { type: Number, min: 0 }, 
//     status: { type: String, enum: ['Submitted', 'Graded'], default: 'Submitted' },
//   },
//   {
//     timestamps: true,
//   }
// );

export default mongoose.model<ISubmission>('Submission', submissionSchema);
