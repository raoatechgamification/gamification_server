import { Request, Response, NextFunction } from "express";
import Group from "../models/group.model";
import { ResponseHandler } from "../middlewares/responseHandler.middleware";

export class GroupController {
  async createGroup(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        name,
        learnerTerm,
        generalLearnerGroupTerm,
        groups,
        generalSubLearnerGroupTerm,
        subGroups,
        generalInstructorTerm,
        instructorNames,
        maxMembersPerProgram,
        idFormat,
        personalization,
      } = req.body;

      const newGroup = new Group({
        name,
        basicCustomization: {
          learnerTerm,
          learnerGroup: {
            generalTerm: generalLearnerGroupTerm,
            groups,
          },
          subLearnerGroup: {
            generalSubTerm: generalSubLearnerGroupTerm,
            subGroups: subGroups.map((subGroupName: string) => ({
              name: subGroupName,
            })),
          },
          instructor: {
            generalInstructorTerm,
            names: instructorNames,
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
    } catch (error) {
      next(error);
    }
  }

  async editGroup(req: Request, res: Response, next: NextFunction) {
    try {
      const { groupId } = req.params;
      const {
        name,
        learnerTerm,
        generalLearnerGroupTerm,
        groups,
        generalSubLearnerGroupTerm,
        subGroups,
        generalInstructorTerm,
        instructorNames,
        maxMembersPerProgram,
        idFormat,
        personalization,
      } = req.body;

      const updatedGroup = await Group.findByIdAndUpdate(
        groupId,
        {
          $set: {
            name,
            "basicCustomization.learnerTerm": learnerTerm,
            "basicCustomization.learnerGroup.generalTerm": generalLearnerGroupTerm,
            "basicCustomization.learnerGroup.groups": groups,
            "basicCustomization.subLearnerGroup.generalSubTerm": generalSubLearnerGroupTerm,
            "basicCustomization.subLearnerGroup.subGroups": subGroups.map(
              (subGroupName: string) => ({
                name: subGroupName,
              })
            ),
            "basicCustomization.instructor.generalInstructorTerm": generalInstructorTerm,
            "basicCustomization.instructor.names": instructorNames,
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
    } catch (error) {
      next(error);
    }
  }
}
