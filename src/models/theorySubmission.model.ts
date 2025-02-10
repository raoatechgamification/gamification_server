import mongoose, { Document, Schema } from "mongoose";

export interface ITheorySubmission extends Document {
  assessmentId: mongoose.Types.ObjectId;
  learnerId: mongoose.Types.ObjectId;
  answers: {
    question: string;
    submittedAnswer: string;
    mark?: number;
  }[];
  score: number;
  status: string;
  submittedFile?: string;
  comments?: string;
  submittedAt: Date;
}

const TheorySubmissionSchema = new Schema<ITheorySubmission>(
  {
    assessmentId: { type: Schema.Types.ObjectId, required: true, ref: "TheoryAssessment" },
    learnerId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    answers: [
      {
        question: { type: String, required: true },
        submittedAnswer: { type: String, required: true },
        mark: { type: Number },
      },
    ],
    status: { type: String, enum: ['Submitted', 'Graded'], default: "Submitted"},
    score: { type: Number, min: 0},
    submittedFile: { type: String },
    comments: { type: String },
    submittedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ITheorySubmission>("TheorySubmission", TheorySubmissionSchema);
