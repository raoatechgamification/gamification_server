import mongoose, { Document, Schema } from "mongoose";

export interface AssessmentDocument extends Document {
  title: string;
  question: string;
  highestAttainableScore: number;
  file?: string;
  courseIds: { type: Schema.Types.ObjectId; ref: "Course" }[];
  instructorId: string;
}

const assessmentSchema = new Schema<AssessmentDocument>(
  {
    title: { type: String, required: true },
    question: { type: String, required: true },
    highestAttainableScore: { type: Number, required: true, min: 0 },
    file: { type: String },
    courseIds: [{ type: Schema.Types.ObjectId, ref: "Course" }],
    instructorId: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<AssessmentDocument>(
  "Assessment",
  assessmentSchema
);
