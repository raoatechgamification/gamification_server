import mongoose, { Document, Schema } from 'mongoose';

export interface AnnouncementDocument extends Document {
  title: string;
  details: string;
  courseIds: string;
}

const announcementSchema = new Schema<AnnouncementDocument>(
  {
    title: { type: String, required: true },
    details: { type: String, required: true },
    courseIds: { type: String, required: true }, 
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<AnnouncementDocument>('Announcement', announcementSchema);