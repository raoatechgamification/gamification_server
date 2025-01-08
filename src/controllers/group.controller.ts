import { Request, Response, NextFunction } from "express";
import Group from "../models/group.model";
import { ResponseHandler } from "../middlewares/responseHandler.middleware";

export class GroupController {
  async createGroup(req: Request, res: Response) {
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

  async editGroup(req: Request, res: Response) {
    try {
      const { groupId } = req.params;
      const {
        name,
        generalLearnerTerm,
        generalLearnerGroupTerm,
        groups,
        generalSubLearnerGroupTerm,
        subGroupsName,
        generalInstructorTerm,
        instructorNames,
        maxMembersPerProgram,
        idFormat,
        personalization,
      } = req.body;

      const organizationId = req.admin._id;
      
      const group = await Group.findOne({ _id: groupId, organizationId });
      if (!group) {
        return ResponseHandler.failure(
          res,
          "Group not found or does not belong to your organization",
          404
        );
      }

      const updatedGroup = await Group.findByIdAndUpdate(
        groupId,
        {
          $set: {
            name,
            "basicCustomization.generalLearnerTerm": generalLearnerTerm,
            "basicCustomization.learnerGroup.generalLearnerGroupTerm": generalLearnerGroupTerm,
            "basicCustomization.learnerGroup.groups": groups,
            "basicCustomization.subLearnerGroup.generalSubLearnerGroupTerm": generalSubLearnerGroupTerm,
            "basicCustomization.subLearnerGroup.subLearnerGroups": subGroupsName.map(
              (subGroupName: string) => ({ name: subGroupName })
            ),
            "basicCustomization.instructor.generalInstructorTerm": generalInstructorTerm,
            "basicCustomization.instructor.names": instructorNames.map((name: string) => ({
              name,
            })),
            "advancedCustomization.academicProgram.maxMembersPerProgram": maxMembersPerProgram,
            "advancedCustomization.idFormat": idFormat,
            "advancedCustomization.personalization": personalization,
          },
        },
        { new: true, runValidators: true }
      );

      if (!updatedGroup) {
        return ResponseHandler.failure(res, "Group not found", 404);
      }

      return ResponseHandler.success(res, updatedGroup, "Group updated successfully");
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        `Server error: ${error.message}`,
        500
      );
    }
  }

  async getGroupById(req: Request, res: Response) {
    try {
      const { groupId } = req.params;
      const organizationId = req.admin._id; 

      const group = await Group.findOne({ _id: groupId, organizationId });

      if (!group) {
        return ResponseHandler.failure(res, "Group not found or does not belong to your organization", 404);
      }

      return ResponseHandler.success(res, group, "Group retrieved successfully");
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        `Server error: ${error.message}`,
        500
      );
    }
  }

  async getAllGroups(req: Request, res: Response) {
    try {
      const organizationId = req.admin._id; 

      const groups = await Group.find({ organizationId });

      if (!groups.length) {
        return ResponseHandler.failure(res, "No groups found for your organization", 404);
      }

      return ResponseHandler.success(res, groups, "Groups retrieved successfully");
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        `Server error: ${error.message}`,
        500
      );
    }
  }
}
