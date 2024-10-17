import mongoose, { Document, Schema } from 'mongoose';

export interface assignedBillDocument extends Document {
  billId: Schema.Types.ObjectId;
  assigneeId: Schema.Types.ObjectId;
  assigneeType: string;
  status: string;
  paymentId: string;
}

const assignedBillSchema = new Schema<assignedBillDocument>(
  {
    billId: { type: Schema.Types.ObjectId, required: true},
    assigneeId: { type: String, required: true },
    assigneeType: { type: String, required: true },
    status: { type: String, required: true },
    paymentId: { type: String }
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<assignedBillDocument>('assignedBill', assignedBillSchema);