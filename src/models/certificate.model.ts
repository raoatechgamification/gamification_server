import mongoose, { Schema, Document, Model, Mongoose } from 'mongoose';

export interface ICertificate extends Document {
  organizationId: mongoose.Schema.Types.ObjectId;
  organizationLogo?: string; // URL of the logo
  organizationName?: string;
  certificateTitle: string;
  courseId?: mongoose.Schema.Types.ObjectId;
  contentsBeforeRecipient?: string;
  contentsAfterRecipient?: string;
  recipientName: string;
  awardedOn: string;
  dateIssued: Date;
  expiryDate?: String;
  authorizedHeadName?: string;
  authorizedSignature1?: string; // URL of the first signature
  authorizedSignature1Name?: string;
  authorizedSignature1Title?: string;
  authorizedSignature2?: string; // URL of the second signature
  authorizedSignature2Name?: string;
  authorizedSignature2Title?: string;
  certificateId: string; // Unique identifier
  logo1?: string;
  logo2?: string;
  organisationName: string;
}

const CertificateSchema: Schema<ICertificate> = new Schema(
  {
    organisationName: { type: String, required: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, required: true },
    organizationLogo: { type: String },
    organizationName: { type: String },
    certificateTitle: { type: String, required: true },
    courseId: { type: Schema.Types.ObjectId },
    contentsBeforeRecipient: { type: String },
    contentsAfterRecipient: { type: String },
    recipientName: { type: String, required: true },
    awardedOn: { type: String, required: true },
    dateIssued: { type: Date, required: true, default: Date.now },
    expiryDate: { type: String },
    authorizedHeadName: { type: String },
    authorizedSignature1: { type: String },
    authorizedSignature1Name: { type: String },
    authorizedSignature1Title: { type: String },
    authorizedSignature2: { type: String },
    authorizedSignature2Name: { type: String },
    authorizedSignature2Title: { type: String },
    certificateId: { type: String, unique: true },
    logo1: {type: String},
    logo2: {type: String}
  },
  {
    timestamps: true,
  }
);

// Create a pre-save hook to generate a unique certificate ID
CertificateSchema.pre<ICertificate>('save', function (next) {
  if (!this.certificateId) {
    this.certificateId = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
  next();
});

const Certificate = mongoose.model<ICertificate>('Certificate', CertificateSchema);
export default Certificate;

export type CertificateDocument = ICertificate;
