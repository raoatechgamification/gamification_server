import mongoose, { Document, Schema } from "mongoose";

export interface ITheorySubmission extends Document {
  assessmentId: mongoose.Types.ObjectId;
  learnerId: mongoose.Types.ObjectId;
  answers: {
    question: string;
    submittedAnswer: string;
    mark?: number;
  }[];
  submittedAt: Date;
}

const submissionSchema = new Schema<ITheorySubmission>(
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
    submittedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ITheorySubmission>("Submission", submissionSchema);
