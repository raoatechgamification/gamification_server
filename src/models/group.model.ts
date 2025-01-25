import mongoose, { Document, Model, Schema } from "mongoose";

interface SubLearnerGroup {
  [x: string]: any;
  // _id: string;
  name: string;
}

interface IGroup extends Document {
  name: string;
  organizationId: mongoose.Schema.Types.ObjectId;
  numberOfArms: number;
  subGroupsName?: {
    name: string;
  }[];
  basicCustomization: {
    generalLearnerTerm: "learner" | "staff" | "student" | "trainee" | "user";
    learnerGroup: {
      generalLearnerGroupTerm: "class" | "group" | "batch";
      groups: { name: string }[];
    };
    subLearnerGroup: {
      generalSubLearnerGroupTerm: "facilitator" | "arm" | "cohort";
      subLearnerGroups: SubLearnerGroup[];
    };
    instructor: {
      generalInstructorTerm:
        | "instructor"
        | "teacher"
        | "facilitator"
        | "trainer"
        | "lecturer";
      names: { name: string }[];
    };
  };
  advancedCustomization: {
    academicProgram: {
      maxMembersPerProgram: number;
    };
    idFormat: "learner" | "staff" | "student" | "trainee" | "user";
    personalization: string;
  };
}

const GroupSchema: Schema<IGroup> = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    organizationId: { type: mongoose.Schema.Types.ObjectId, required: true },
    numberOfArms: { type: Number, required: true },
    subGroupsName: {
      type: [
        {
          name: {
            type: String,
            required: true,
          },
        },
      ],
      default: [],
    },
    basicCustomization: {
      generalLearnerTerm: {
        type: String,
        enum: ["learner", "staff", "student", "trainee", "user"],
        required: true,
      },
      learnerGroup: {
        generalLearnerGroupTerm: {
          type: String,
          enum: ["class", "group", "batch"],
          required: true,
        },
        groups: [
          {
            name: {
              type: String,
              required: true,
            },
          },
        ],
      },
      subLearnerGroup: {
        generalSubLearnerGroupTerm: {
          type: String,
          enum: ["facilitator", "arm", "cohort"],
          required: true,
        },
        subLearnerGroups: [
          {
            // _id: {
            //   type: mongoose.Schema.Types.ObjectId,  // Ensure _id is ObjectId
            // },
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
            name: {
              type: String,
              required: true,
            },
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

const Groupp: Model<IGroup> = mongoose.model<IGroup>("Groupp", GroupSchema);

export default Groupp;
