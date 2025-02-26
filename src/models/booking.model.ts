import mongoose, { Document, Model, Schema } from "mongoose";

export interface IBooking extends Document {
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  timeZone: string;
  frequency: "none" | "daily" | "weekly" | "monthly";
  participants: mongoose.Types.ObjectId[];
  organizationId: mongoose.Types.ObjectId;
  calendarEventId?: string;
  reminder?: "email" | "sms" | string;
  conferenceData?: Record<string, any>;
  courseId?: mongoose.Types.ObjectId;
  time?: string;
}

const BookingSchema: Schema<IBooking> = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, trim: true },
    startDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (this: IBooking, value: Date) {
          return value < this.endDate;
        },
        message: "Start date must be earlier than end date.",
      },
    },
    endDate: { type: Date, required: true },
    timeZone: { type: String, required: true },
    frequency: {
      type: String,
      enum: ["none", "daily", "weekly", "monthly"],
      default: "none",
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    calendarEventId: { type: String, trim: true },
    reminder: {
      type: String,
      enum: ["email", "sms", "push", "whatsapp"],
      trim: true,
    },
    conferenceData: { type: mongoose.Schema.Types.Mixed },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    time: { type: String, required: false },
  },
  {
    timestamps: true,
  }
);

const BookingModel: Model<IBooking> = mongoose.model<IBooking>(
  "Booking",
  BookingSchema
);

export default BookingModel;
