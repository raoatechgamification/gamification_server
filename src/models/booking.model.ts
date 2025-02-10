import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBooking extends Document {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  timeZone: string;
  frequency: string;
  participants: mongoose.Types.ObjectId[]; 
  organizationId: mongoose.Types.ObjectId;
  calendarEventId?: string; 
  createdBy: mongoose.Types.ObjectId;
  meetData?: any;
  reminder?: string
}

const BookingSchema: Schema<IBooking> = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    timeZone: { type: String, required: true },
    frequency: { type: String, enum: ["none", "daily", "weekly", "monthly"], default: "none" },
    participants: [{ type: mongoose.Types.ObjectId, ref: "User", required: true }],
    organizationId: { type: mongoose.Types.ObjectId, ref: "Organization", required: true },
    calendarEventId: { type: String },
    createdBy: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    meetData: { type: mongoose.Schema.Types.Mixed },
    reminder: { type: String }
  }, {
    timestamps: true
  }
);

const BookingModel: Model<IBooking> = mongoose.model<IBooking>("Booking", BookingSchema)

export default BookingModel;