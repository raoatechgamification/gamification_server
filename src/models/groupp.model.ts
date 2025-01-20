import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISubGroup {
  name: string;
  members: mongoose.Schema.Types.ObjectId[];
}

export interface IGroup extends Document {
  name: string;
  numberOfArms: number;
  subGroups: ISubGroup[];
  members?: mongoose.Schema.Types.ObjectId[]; 
  organizationId: mongoose.Schema.Types.ObjectId;
}

const SubGroupSchema: Schema<ISubGroup> = new Schema({
  name: { type: String, required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] }],
});

const GroupSchema: Schema<IGroup> = new Schema({
  name: { type: String, required: true },
  numberOfArms: { type: Number, required: true },
  subGroups: { type: [SubGroupSchema], default: [] },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] }], 
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
});

const Group: Model<IGroup> = mongoose.model<IGroup>("Group", GroupSchema);

export default Group;
