import mongoose, { Schema, Document } from 'mongoose';

export interface AssessmentQuestionInterface {
  _id: string;
  question: string;
  answer: string; // Correct answer
  mark?: number;
}

export interface AssessmentInterface {
  _id: string;
  questions: AssessmentQuestionInterface[]; // Ensure 'questions' is an array
  marksPerQuestion?: number;
}


interface IObjectiveAssessment extends Document {
  organizationId: string;
  title: string;
  description: string;
  marksPerQuestion?: number; 
  numberOfTrials?: number;
  purpose?: string;
  position: number;
  passMark: number;
  duration: number;
  startDate?: Date;
  endDate?: Date;
  assessmentCode: string;
  questions: {
    question: string;
    type: string;
    options?: string[];
    answer: string;
    mark?: number; // Optional mark for each question
  }[];
}

// Define the schema
const objectiveAssessmentSchema = new Schema<IObjectiveAssessment>({
  organizationId: { type: String, required: true},
  title: { type: String, required: true },
  description: { type: String, required: true },
  marksPerQuestion: { type: Number },
  numberOfTrials: { type: Number, default: null },
  purpose: { type: String, default: null },
  position: { type: Number, required: true },
  passMark: { type: Number, required: true },
  duration: { type: Number, required: true },
  startDate: { type: Date, default: null },
  endDate: { type: Date, default: null },
  assessmentCode: { type: String, required: true },
  questions: [
    {
      question: { type: String, required: true },
      type: {
        type: String,
        enum: ['True or False', 'Yes or No', 'Fill in the Gap', 'Multichoice'],
        required: true,
      },
      options: { type: [String], default: [] },
      answer: { type: String, required: true },
      mark: { type: Number, default: null }, // Optional field
    },
  ],
});

const ObjectiveAssessment =
  mongoose.models.ObjectiveAssessment ||
  mongoose.model<IObjectiveAssessment>('ObjectiveAssessment', objectiveAssessmentSchema);

export default ObjectiveAssessment;
