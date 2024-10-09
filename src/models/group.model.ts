import mongoose, { Schema, Document, Model } from "mongoose";

interface IGroup extends Document {
  name: string;
  basicCustomization: {
    learnerTerm: string; // learner, staff, student, trainee, or user
    learnerGroup: {
      generalTerm: string; // class, group, or batch
      groups: string[]; // List of group names
    };
    subLearnerGroup: {
      generalSubTerm: string; // facilitator, arm, or cohort
      subGroups: { name: string }[]; // List of sub-group objects, each having a name
    };
    instructor: {
      generalInstructorTerm: string; // instructor, teacher, facilitator, trainer, or lecturer
      names: string[]; // List of instructor names
    };
  };
  advancedCustomization: {
    academicProgram: {
      maxMembersPerProgram: number; // Max number of members per program
    };
    idFormat: string; // learner, staff, student, trainee, user
    personalization: string; // Any string value
  };
}

const GroupSchema: Schema<IGroup> = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
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
