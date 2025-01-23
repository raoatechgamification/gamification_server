import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAssignedCourse {
  courseId: mongoose.Types.ObjectId;
  courseName: string;
}

export interface ISubGroup {
  _id: mongoose.Types.ObjectId; // Add this line
  name: string;
  members: mongoose.Types.ObjectId[];
  assignedCourses?: IAssignedCourse[];
}

export interface IGroup extends Document {
  _id: mongoose.Types.ObjectId; 
  name: string;
  numberOfArms: number;
  subGroups: ISubGroup[];
  members: mongoose.Types.ObjectId[]; 
  assignedCourses?: IAssignedCourse[];
  organizationId: mongoose.Types.ObjectId;
}

const AssignedCourseSchema: Schema<IAssignedCourse> = new Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  courseName: { type: String, required: true },
});

const SubGroupSchema: Schema<ISubGroup> = new Schema({
  name: { type: String, required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] }],
  assignedCourses: { type: [AssignedCourseSchema], default: [] }, 
});

const GroupSchema: Schema<IGroup> = new Schema(
  {
    name: { type: String, required: true },
    numberOfArms: { type: Number, required: true },
    subGroups: { type: [SubGroupSchema], default: [] },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] }],
    assignedCourses: { type: [AssignedCourseSchema], default: [] }, // New field for group courses
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
  },
  { timestamps: true }
);

const Group: Model<IGroup> = mongoose.model<IGroup>("Group", GroupSchema);
export const SubGroup: Model<ISubGroup> = mongoose.model<ISubGroup>("SubGroup", SubGroupSchema)

export default Group;
