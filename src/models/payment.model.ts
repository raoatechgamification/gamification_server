import mongoose, { Document, Schema } from 'mongoose';

export interface UserPaymentMethodDocument extends Document {
  userId: string;
  cardToken: string;
  last4Digits: string;
  cardType: string;
  expiryMonth: string;
  expiryYear: string;
}

const userPaymentMethodSchema = new Schema<UserPaymentMethodDocument>(
  {
    userId: { type: String, required: true },
    cardToken: { type: String, required: true },
    last4Digits: { type: String, required: true },
    cardType: { type: String, required: true },
    expiryMonth: { type: String, required: true },
    expiryYear: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<UserPaymentMethodDocument>(
  'UserPaymentMethod',
  userPaymentMethodSchema
);
