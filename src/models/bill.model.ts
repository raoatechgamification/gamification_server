import mongoose, { Document, Schema } from 'mongoose';

export interface BillDocument extends Document {
  organizationId: Schema.Types.ObjectId;
  title: string;
  summary: string;
  amount: number;
  dueDate: Date;
  billFor: string;
  assignee: string[];
}

const BillSchema = new Schema<BillDocument>(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true},
    title: { type: String, required: true },
    summary: { type: String, required: true },
    amount: { type: Number, required: true }, 
    dueDate: { type: Date, required: true }, 
    billFor: { type: String, required: true }, 
    assignee: { type: [String], required: true }, 
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<BillDocument>('Bill', BillSchema);