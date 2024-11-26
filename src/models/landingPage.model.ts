import mongoose, { Schema, Document } from 'mongoose';

export interface ILandingPage extends Document {
  organisationId: string;
  landingPageTitle: string;
  serviceTitleDescription: string;
  servicePicture?: string;
  serviceType: string;
  serviceItem: string;
  serviceItemDescription: string;
  course: mongoose.Types.ObjectId[]; // Reference to Course
  subservice: mongoose.Types.ObjectId[]; // Reference to Service
}

const LandingPageSchema = new Schema<ILandingPage>(
  {
    organisationId: { type: String, required: false },
    landingPageTitle: { type: String, required: false, unique: true},
    serviceTitleDescription: { type: String, required: false },
    servicePicture: { type: String, required: false},
    serviceType: { type: String, required: false },
    serviceItem: { type: String, required: false },
    serviceItemDescription: { type: String, required: false },
    course: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
    subservice: [{ type: Schema.Types.ObjectId, ref: 'Subservice' }],
  },
  { timestamps: true }
);

export const LandingPage = mongoose.models.LandingPage || mongoose.model('LandingPage', LandingPageSchema);
