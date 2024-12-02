import mongoose, { Schema, Document, Model } from 'mongoose';

interface IQuestion {
  question: string;
  type: 'True or False' | 'Yes or No' | 'Fill in the Gap' | 'Multichoice';
  options?: string[]; // Optional for non-multichoice questions
  answer: string;
  score: number;
}

interface IAssessment extends Document {
  assessmentCode: string;
  title: string;
  description: string;
  marksPerQuestion: number;
  numberOfTrials?: number;
  purpose?: string;
  position: number;
  passMark: number;
  duration: number;
  startDate?: Date;
  endDate?: Date;
  questions: IQuestion[];
}

const QuestionSchema = new Schema<IQuestion>({
  question: { type: String, required: true },
  type: { type: String, enum: ['True or False', 'Yes or No', 'Fill in the Gap', 'Multichoice'], required: true },
  options: [{ type: String }],
  answer: { type: String, required: true },
  score: { type: Number, required: true },
});

const AssessmentSchema = new Schema<IAssessment>({
  assessmentCode: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  marksPerQuestion: { type: Number, required: true },
  numberOfTrials: { type: Number },
  purpose: { type: String },
  position: { type: Number, required: true, unique: true },
  passMark: { type: Number, required: true },
  duration: { type: Number, required: true },
  startDate: { type: Date },
  endDate: { type: Date },
  questions: [QuestionSchema],
});

const Assessment: Model<IAssessment> = mongoose.model('Assessment', AssessmentSchema);
export default Assessment;
