import mongoose, { Document, Schema } from "mongoose";

export interface Permission extends Document {
  module: string;
  action: string;
}

const PermissionSchema = new Schema<Permission>({
  module: { type: String, required: true },
  action: { type: String, required: true },
});

export const PermissionModel = mongoose.model<Permission>("Permission", PermissionSchema);
