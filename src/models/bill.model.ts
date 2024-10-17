import mongoose, { Document, Schema } from 'mongoose';

export interface BillDocument extends Document {
  organizationId: Schema.Types.ObjectId;
  title: string;
  summary: string;
  amount: number;
  dueDate: Date;
  billFor: string;
  // assignee: {
  //   terms: Schema.Types.ObjectId[];
  //   sessions: Schema.Types.ObjectId[];
  //   individuals: Schema.Types.ObjectId[];
  //   groups: Schema.Types.ObjectId[];
  //   subgroups: Schema.Types.ObjectId[];
  // };
}

const BillSchema = new Schema<BillDocument>(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true},
    title: { type: String, required: true },
    summary: { type: String, required: true },
    amount: { type: Number, required: true }, 
    dueDate: { type: Date, required: true }, 
    billFor: { type: String, required: true }, 
    // assignee: {
    //   terms: [{ 
    //     type: Schema.Types.ObjectId, 
    //     // ref: 'Term', 
    //     required: false }], 
    //   sessions: [{ 
    //     type: Schema.Types.ObjectId, 
    //     // ref: 'Session', 
    //     required: false }], 
    //   individuals: [{ 
    //     type: Schema.Types.ObjectId, 
    //     ref: 'User', 
    //     required: false }], 
    //   groups: [{ 
    //     type: Schema.Types.ObjectId, 
    //     ref: 'Group', 
    //     required: false 
    //   }], 
    //   subgroups: [{
    //     type: Schema.Types.ObjectId,
    //     // ref: 'Subgroup',
    //     required: false
    //   }]
    // },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<BillDocument>('Bill', BillSchema);