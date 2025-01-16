import mongoose, { Document, Schema, Model } from "mongoose";
import { IPermission } from "./permission.model";

export interface IRole extends Document {
  name: string;
  permissions: mongoose.Types.ObjectId[] | IPermission[];
}

const RoleSchema: Schema<IRole> = new Schema({
  name: { type: String, required: true, unique: true },
  permissions: [{ type: Schema.Types.ObjectId, ref: "Permission" }],
});

const RoleModel: Model<IRole> = mongoose.model<IRole>("Role", RoleSchema);

export default RoleModel