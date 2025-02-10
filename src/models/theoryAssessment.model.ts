import mongoose, { Document, Schema } from "mongoose";
import Organization from "./organization.model";

export interface ITheoryAssessment extends Document {
  organizationId: mongoose.Types.ObjectId;
  title: string;
  // file?: string;
  description: string;
  position: number;
  totalMark: number;
  passMark: number;
  duration: number;
  assessmentCode: string;
  questions: {
    [x: string]: any;
    question: string;
    marks: number; 
    time?: string;
    file?: { type: String }, 
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
    // file: { type: String }, 
    questions: [
      {
        question: { type: String, required: true },
        marks: { type: Number, required: true }, 
        time: { type: String },
        file: { type: String }, 
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
