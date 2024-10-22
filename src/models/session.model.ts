import mongoose, { Document, Schema } from 'mongoose';

export interface SessionDocument extends Document {
  organizationId: Schema.Types.ObjectId,
  name: {
    title: string;
    commencementDate: Date;
    endDate: Date;
    termsInSession: number;
  };
  terms: [{
    title: string;
    commencementDate: Date;
    endDate: Date;
  }];
  bills: [{
    termName: string;
    billId: Schema.Types.ObjectId
  }];
  oneBillForAnEntireSession: boolean;
}

const sessionSchema = new Schema<SessionDocument>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Bill', required: true },
    name: {
      title: { type: String, required: true },
      commencementDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
      termsInSession: { type: Number, required: true}
    },
    terms: [{
      title: { type: String, required: true },
      commencementDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
    }],
    bills: [{
      termName: { type: String, required: true },
      billId: { type: Schema.Types.ObjectId, required: true },
    }],
    oneBillForAnEntireSession: { type: Boolean, required: true}
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<SessionDocument>('Session', sessionSchema);
