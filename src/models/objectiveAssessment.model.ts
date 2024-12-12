import mongoose, { Schema, Document } from 'mongoose';

export interface AssessmentQuestionInterface {
  _id: string;
  question: string;
  answer: string; 
  mark?: number;
}

export interface AssessmentInterface {
  _id: string;
  questions: AssessmentQuestionInterface[]; 
  marksPerQuestion?: number;
}


interface IObjectiveAssessment extends Document {
  organizationId: Schema.Types.ObjectId;
  title: string;
  description: string;
  marksPerQuestion?: number; 
  numberOfTrials?: number;
  purpose?: string;
  position: number;
  totalMark: number;
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
    mark: number; 
  }[];
}

const objectiveAssessmentSchema = new Schema<IObjectiveAssessment>({
  organizationId: { type: Schema.Types.ObjectId, required: true},
  title: { type: String, required: true },
  description: { type: String, required: true },
  marksPerQuestion: { type: Number },
  numberOfTrials: { type: Number, default: null },
  purpose: { type: String, default: null },
  position: { type: Number, required: true },
  totalMark: { type: Number, required: true },
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
      mark: { type: Number, required: true }, 
    },
  ],
});

const ObjectiveAssessment =
  mongoose.models.ObjectiveAssessment ||
  mongoose.model<IObjectiveAssessment>('ObjectiveAssessment', objectiveAssessmentSchema);

export default ObjectiveAssessment;
