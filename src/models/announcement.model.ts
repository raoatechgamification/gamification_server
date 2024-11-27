import mongoose, { Document, Schema } from 'mongoose';

export interface AnnouncementDocument extends Document {
  title: string;
  details: string;
  courseIds: mongoose.Types.ObjectId[];
}

const announcementSchema = new Schema<AnnouncementDocument>(
  {
    title: { type: String, required: true },
    details: { type: String, required: true },
    courseIds: { type: [Schema.Types.ObjectId], ref: 'Course', default: [] }, 
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<AnnouncementDocument>('Announcement', announcementSchema);