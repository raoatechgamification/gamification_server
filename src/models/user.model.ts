import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICard {
  cardToken: string;
  last4: string;
  brand: string;
  expiryMonth: string;
  expiryYear: string;
}

export interface IUser extends Document {
  username: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  organization?: mongoose.Schema.Types.ObjectId;
  role: string;
  password: string;
  yearOfExperience?: number;
  highestEducationLevel?: string;
  gender?: string;
  dateOfBirth?: string;
  cards?: ICard[];
}

const CardSchema: Schema = new Schema({
  cardToken: { type: String, required: true },
  last4: { type: String, required: true },
  brand: { type: String, required: true },
  expiryMonth: { type: String, required: true },
  expiryYear: { type: String, required: true },
});

const UserSchema: Schema<IUser> = new Schema(
  {
    username: { type: String, required: true },
    firstName: { type: String, default: null },
    lastName: { type: String, default: null },
    email: { type: String, required: true, unique: true },
    phone: { type: String, default: null },
    organization: { type: mongoose.Schema.Types.ObjectId, default: null },
    role: { type: String, default: "user", required: true },
    password: { type: String, required: true },
    yearOfExperience: { type: Number, default: null },
    highestEducationLevel: { type: String, default: null },
    gender: { type: String, default: null },
    dateOfBirth: { type: String, default: null },
    cards: [CardSchema],  
  },
  { timestamps: true }
);

const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);
export default User;
export type UserDocument = IUser;


// import mongoose, { Schema, Document, Model } from "mongoose";

// export interface IUser extends Document {
//   username: string;
//   firstName?: string;
//   lastName?: string;
//   email: string;
//   phone?: string;
//   organization?: mongoose.Schema.Types.ObjectId;
//   role: string;
//   password: string;
//   yearOfExperience?: number;
//   highestEducationLevel?: string;
//   gender?: string;
//   dateOfBirth?: string;
// }

// const UserSchema: Schema<IUser> = new Schema(
//   {
//     username: { type: String, required: true },
//     firstName: { type: String, default: null, },
//     lastName: { type: String, default: null, },
//     email: { type: String, required: true, unique: true, },
//     phone: { type: String, default: null, },
//     organization: { type: mongoose.Schema.Types.ObjectId, default: null, },
//     role: { type: String, default: "user", required: true, },
//     password: { type: String, required: true, },
//     yearOfExperience: { type: Number, default: null, },
//     highestEducationLevel: { type: String, default: null, },
//     gender: { type: String, default: null, },
//     dateOfBirth: { type: String, default: null, },
//   }, {
//     timestamps: true,
//   }
// );

// const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);

// export default User;
// export type UserDocument = IUser;
