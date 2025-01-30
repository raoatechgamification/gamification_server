import mongoose, { Document, Schema, Model } from "mongoose";
import { IPermission } from "./permission.model";

export interface IRole extends Document {
  name: string;
  organizationId: mongoose.Types.ObjectId;
  permissions: mongoose.Types.ObjectId[] | IPermission[];
}

const RoleSchema: Schema<IRole> = new Schema({
  name: { type: String, required: true },
  organizationId: { type: Schema.Types.ObjectId, ref: "Organization"},
  permissions: [{ type: Schema.Types.ObjectId, ref: "Permission" }],
});

const RoleModel: Model<IRole> = mongoose.model<IRole>("Role", RoleSchema);

export default RoleModel
