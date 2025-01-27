import mongoose, { Document, Schema } from "mongoose";
import Organization from "./organization.model";

export interface ITheoryAssessment extends Document {
  organizationId: mongoose.Types.ObjectId;
  title: string;
  file?: string;
  description: string;
  position: number;
  totalMark: number;
  passMark: number;
  duration: number;
  assessmentCode: string;
  questions: {
    question: string;
    answer: string;
    mark: number; 
    time: string;
  }[];
}

const theoryAssessmentSchema = new Schema<ITheoryAssessment>(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, ref: "Organization"},
    title: { type: String, required: true },
    description: { type: String, required: true },
    position: { type: Number, required: true },
    totalMark: { type: Number, required: true },
    passMark: { type: Number, required: true },
    duration: { type: Number, required: true },
    assessmentCode: { type: String, required: true },
    questions: [
      {
        question: { type: String, required: true },
        answer: { type: String, required: true },
        mark: { type: Number, required: true }, 
        time: { type: String },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ITheoryAssessment>(
  "TheoryAssessment",
  theoryAssessmentSchema
);
