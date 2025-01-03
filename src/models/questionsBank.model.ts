import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestionsBank extends Document {
  name: string; 
  organizationId: Schema.Types.ObjectId; 
  groups?: {
    name: string; 
    questions: {
      question: string; 
      type: 'True or False' | 'Yes or No' | 'Fill in the Gap' | 'Multichoice'; 
      options?: string[]; 
      answer: string; 
      mark: number; 
    }[];
  }[]; 
}

const questionsBankSchema = new Schema<IQuestionsBank>({
  name: { type: String, required: true }, 
  organizationId: { type: Schema.Types.ObjectId, required: true, ref: 'Organization' }, 
  groups: {
    type: [
      {
        name: { type: String, required: true }, 
        questions: [
          {
            question: { type: String, required: true }, 
            type: {
              type: String,
              enum: ['True or False', 'Yes or No', 'Fill in the Gap', 'Multichoice'], 
              required: true,
            },
            options: {
              type: [String],
              validate: {
                validator: function (value: string[]) {
                  return this.type !== 'Multichoice' || (value && value.length > 0);
                },
                message: 'Options are required for "Multichoice" type questions',
              },
              default: [], 
            },
            answer: { type: String, required: true }, 
            mark: { type: Number, required: true }, 
          },
        ],
      },
    ],
    default: [], 
  },
});

const QuestionsBank =
  mongoose.models.QuestionsBank || mongoose.model<IQuestionsBank>('QuestionsBank', questionsBankSchema);

export default QuestionsBank;
