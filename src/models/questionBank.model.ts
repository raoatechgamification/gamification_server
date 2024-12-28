import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestionBank extends Document {
  name: string;
  organizationId: Schema.Types.ObjectId;
  assessmentIds: Schema.Types.ObjectId[];
}

const questionBankSchema = new Schema<IQuestionBank>({
  name: { type: String, required: true },
  organizationId: { type: Schema.Types.ObjectId, required: true, ref: 'Organization' },
  assessmentIds: { type: [Schema.Types.ObjectId], required: true, ref: 'ObjectiveAssessment' },
});

const QuestionBank =
  mongoose.models.QuestionBank || mongoose.model<IQuestionBank>('QuestionBank', questionBankSchema);

export default QuestionBank;
