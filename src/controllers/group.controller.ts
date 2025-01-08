import { Request, Response, NextFunction } from "express";
import Group from "../models/group.model";
import { ResponseHandler } from "../middlewares/responseHandler.middleware";

export class GroupController {
  async createGroup(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        name,
        generalLearnerTerm,
        generalLearnerGroupTerm,
        groups,
        generalSubLearnerGroupTerm,
        subGroupsName,
        generalInstructorTerm,
        instructorNames,
        numberOfArms,
        maxMembersPerProgram,
        idFormat,
        personalization,
      } = req.body;

      const organizationId = req.admin._id;

      const newGroup = new Group({
        name,
        organizationId,
        numberOfArms,
        basicCustomization: {
          generalLearnerTerm,
          learnerGroup: {
            generalLearnerGroupTerm,
            groups,
          },
          subLearnerGroup: {
            generalSubLearnerGroupTerm,
            subLearnerGroups: subGroupsName.map((subGroupName: string) => ({
              name: subGroupName,
            })),
          },
          instructor: {
            generalInstructorTerm,
            names: instructorNames.map((name: string) => ({ name })),
          },
        },
        advancedCustomization: {
          academicProgram: {
            maxMembersPerProgram,
          },
          idFormat,
          personalization,
        },
      });

      const savedGroup = await newGroup.save();

      return ResponseHandler.success(res, savedGroup, "Group created successfully");
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        `Server error: ${error.message}`,
        500
      );
    }
  }
}
