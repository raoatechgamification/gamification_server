import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICertificate extends Document {
  organizationLogo: string; // URL of the logo
  organizationName: string;
  certificateTitle: string;
  contentsBeforeRecipient: string;
  contentsAfterRecipient: string;
  recipientName: string;
  awardedOn: Date;
  dateIssued: Date;
  expiryDate: Date;
  authorizedHeadName: string;
  authorizedSignature: string; // URL of the signature image
  certificateId: string; // Unique identifier
}

const CertificateSchema: Schema<ICertificate> = new Schema(
  {
    organizationLogo: { type: String, required: true },
    organizationName: { type: String, required: true },
    certificateTitle: { type: String, required: true },
    contentsBeforeRecipient: { type: String, required: true },
    contentsAfterRecipient: { type: String, required: true },
    recipientName: { type: String, required: true },
    awardedOn: { type: Date, required: true },
    dateIssued: { type: Date, required: true, default: Date.now },
    expiryDate: { type: Date, required: true },
    authorizedHeadName: { type: String, required: true },
    authorizedSignature: { type: String, required: true },
    certificateId: { type: String, required: true, unique: true },
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
