import mongoose, { Document, Schema } from 'mongoose';

export interface CourseDocument extends Document {
  title?: string;
  objective?: string;
  price?: number;
  instructorId?: string;
  organisationId: string;
  
  lessonFormat?: string;
  learnerIds?: string[];

  duration: string;
  landingPageTitle: string;
  serviceTitleDescription: string;
  servicePicture: string;
  serviceType: string;
  serviceItem: string;
  serviceItemDescription: string;
  courseCode: string;
  courseLevel: string;
  startDate: string;
  endDate: string;
  numberOfHoursPerDay: number;
  numberOfDaysPerWeek: number;
  cost: number;
  promo: number;
  promoCode: string;
  promoValue: number;
  platformCharge: number;
  actualCost: number;
  sharing: number;
  sharingValue: number;
  paymentStartDate: string;
  paymentEndDate: string;
  paymentStartTime: string;
  paymentEndTime: string;
  curriculum: string;
  teachingMethod: string;
  
}

const courseSchema = new Schema<CourseDocument>(
  {
    title: { type: String, required: false },
    objective: { type: String, required: false },
    price: { type: Number, required: false }, 
    instructorId: { type: String, required: false }, 
    duration: { type: String, required: false }, 
    lessonFormat: { type: String, required: false }, 
    learnerIds: { type: [String] },
    landingPageTitle: {
      type: String,
      required: false,
    },
    serviceTitleDescription: {
      type: String,
      required: false,
    },
    servicePicture: {
      type: String,
      required: false,
    },
    serviceType: {
      type: String,
      required: false,
    },
    serviceItem: {
      type: String,
      required: false,
    },
    serviceItemDescription: {
      type: String,
      required: false,
    },
    courseCode: {
      type: String,
      required: false,
    },
    courseLevel: {
      type: String,
      required: false,
    },
    startDate: {
      type: String,
      required: false,
    },
    endDate: {
      type: String,
      required: false,
    },
    numberOfHoursPerDay: {
      type: Number,
      required: false,
    },
    numberOfDaysPerWeek: {
      type: Number,
      required: false,
    },
    cost: {
      type: Number,
      required: false,
    },
    promo: {
      type: Number,
      required: false,
    },
    promoCode: {
      type: String,
      required: false,
    },
    promoValue: {
      type: Number,
      required: false,
    },
    platformCharge: {
      type: Number,
      required: false,
    },
    actualCost: {
      type: Number,
      required: false,
    },
    sharing: {
      type: Number,
      required: false,
    },
    sharingValue: {
      type: Number,
      required: false,
    },
    paymentStartDate: {
      type: String,
      required: false,
    },
    paymentEndDate: {
      type: String,
      required: false,
    },
    paymentStartTime: {
      type: String,
      required: false,
    },
    paymentEndTime: {
      type: String,
      required: false,
    },
    curriculum: {
      type: String,
      required: false,
    },
    teachingMethod: {
      type: String,
      required: false,
    },
    organisationId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: false,
  }
);

export default mongoose.model<CourseDocument>('Course', courseSchema);