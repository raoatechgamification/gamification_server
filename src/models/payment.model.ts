import mongoose, { Document, Schema } from "mongoose";

export interface PaymentDocument extends Document {
  userId: Schema.Types.ObjectId;
  assignedBillId: Schema.Types.ObjectId;
  courseId: Schema.Types.ObjectId;
  status: "pending" | "completed" | "failed";
  reference: string;
  data?: {};
}

const PaymentSchema = new Schema<PaymentDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    assignedBillId: { type: Schema.Types.ObjectId, required: true },
    courseId: { type: Schema.Types.ObjectId, required: true },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      required: true,
    },
    reference: { type: String, required: true },
    data: { type: Object },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<PaymentDocument>("Payment", PaymentSchema);
