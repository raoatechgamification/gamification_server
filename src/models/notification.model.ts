import mongoose, { Document, Schema } from 'mongoose';

export interface NotificationDocument extends Document {
  userId: string;
  courseId: string;
  message: string;
  isRead: boolean;
}

const notificationSchema = new Schema<NotificationDocument>(
  {
    userId: { type: String, required: true },
    courseId: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<NotificationDocument>('Notification', notificationSchema);
