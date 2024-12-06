import mongoose, { Schema, Document, Model } from "mongoose";

interface IGroup extends Document {
  name: string;
  organizationId: mongoose.Schema.Types.ObjectId;
  basicCustomization: {
    learnerTerm: string; 
    learnerGroup: {
      generalTerm: string; 
      groups: string[]; 
    };
    subLearnerGroup: {
      generalSubTerm: string; 
      subGroups: { name: string }[]; 
    };
    instructor: {
      generalInstructorTerm: string; 
      names: string[]; 
    };
  };
  advancedCustomization: {
    academicProgram: {
      maxMembersPerProgram: number; 
    };
    idFormat: string; 
    personalization: string; 
  };
}

const GroupSchema: Schema<IGroup> = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    organizationId: { type: mongoose.Schema.Types.ObjectId, required: true},
    basicCustomization: {
      learnerTerm: {
        type: String,
        enum: ["learner", "staff", "student", "trainee", "user"],
        required: true,
      },
      learnerGroup: {
        generalTerm: {
          type: String,
          enum: ["class", "group", "batch"],
          required: true,
        },
        groups: [
          {
            type: String,
            required: true,
          },
        ],
      },
      subLearnerGroup: {
        generalSubTerm: {
          type: String,
          enum: ["facilitator", "arm", "cohort"],
          required: true,
        },
        subGroups: [
          {
            name: {
              type: String,
              required: true,
            },
          },
        ],
      },
      instructor: {
        generalInstructorTerm: {
          type: String,
          enum: ["instructor", "teacher", "facilitator", "trainer", "lecturer"],
          required: true,
        },
        names: [
          {
            type: String,
            required: true,
          },
        ],
      },
    },
    advancedCustomization: {
      academicProgram: {
        maxMembersPerProgram: {
          type: Number,
          required: true,
        },
      },
      idFormat: {
        type: String,
        enum: ["learner", "staff", "student", "trainee", "user"],
        required: true,
      },
      personalization: {
        type: String,
        default: "",
      },
    },
  },
  { timestamps: true }
);

const Group: Model<IGroup> = mongoose.model<IGroup>("Group", GroupSchema);

export default Group;
