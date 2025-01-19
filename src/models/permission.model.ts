import mongoose, { Document, Schema, Model} from "mongoose";

export interface IPermission extends Document {
  module: string;
  action: string;
}

const PermissionSchema: Schema<IPermission> = new Schema({
  module: { type: String, required: true },
  action: { type: String, required: true },
});

const Permission: Model<IPermission> = mongoose.model<IPermission> ("Permission", PermissionSchema)

export default Permission
