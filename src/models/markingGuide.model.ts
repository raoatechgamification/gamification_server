import mongoose, { Document, Schema } from 'mongoose';

export interface MarkingGuideDocument extends Document {
  assessmentId: string;
  question: string;
  expectedAnswer: string;
  keywords: string[];
  maxScore: number;
}

const markingGuideSchema = new Schema<MarkingGuideDocument>({
  assessmentId: { type: String, required: true },
  question: { type: String, required: true }, 
  expectedAnswer: { type: String, required: true },
  keywords: { type: [String], required: true },
  maxScore: { type: Number, required: true },
  
}, {
  timestamps: true, 
});

export default mongoose.model<MarkingGuideDocument>('MarkingGuide', markingGuideSchema);


