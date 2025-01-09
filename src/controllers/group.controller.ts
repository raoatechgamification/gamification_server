import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import Group from "../models/group.model";
import User from "../models/user.model";
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

      return ResponseHandler.success(
        res,
        savedGroup,
        "Group created successfully"
      );
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
            "basicCustomization.learnerGroup.generalLearnerGroupTerm":
              generalLearnerGroupTerm,
            "basicCustomization.learnerGroup.groups": groups,
            "basicCustomization.subLearnerGroup.generalSubLearnerGroupTerm":
              generalSubLearnerGroupTerm,
            "basicCustomization.subLearnerGroup.subLearnerGroups":
              subGroupsName.map((subGroupName: string) => ({
                name: subGroupName,
              })),
            "basicCustomization.instructor.generalInstructorTerm":
              generalInstructorTerm,
            "basicCustomization.instructor.names": instructorNames.map(
              (name: string) => ({
                name,
              })
            ),
            "advancedCustomization.academicProgram.maxMembersPerProgram":
              maxMembersPerProgram,
            "advancedCustomization.idFormat": idFormat,
            "advancedCustomization.personalization": personalization,
          },
        },
        { new: true, runValidators: true }
      );

      if (!updatedGroup) {
        return ResponseHandler.failure(res, "Group not found", 404);
      }

      return ResponseHandler.success(
        res,
        updatedGroup,
        "Group updated successfully"
      );
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
        return ResponseHandler.failure(
          res,
          "Group not found or does not belong to your organization",
          404
        );
      }

      return ResponseHandler.success(
        res,
        group,
        "Group retrieved successfully"
      );
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
        return ResponseHandler.failure(
          res,
          "No groups found for your organization",
          404
        );
      }

      return ResponseHandler.success(
        res,
        groups,
        "Groups retrieved successfully"
      );
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        `Server error: ${error.message}`,
        500
      );
    }
  }

  //   async assignUsersToGroup(req: Request, res: Response) {
  //     const { userId, groupId, subGroupId } = req.body;

  //     try {
  //         const adminOrganizationId = req.admin._id;

  //         // Validate the group existence and organization
  //         const group = await Group.findById(groupId);
  //         if (!group) {
  //             return res.status(404).json({ message: "Group not found" });
  //         }
  //         if (!group.organizationId || group.organizationId.toString() !== adminOrganizationId.toString()) {
  //             return res.status(403).json({ message: "Group does not belong to your organization" });
  //         }

  //         // Validate subGroupId if provided
  //         if (subGroupId) {
  //           let subGroupExists = false;

  //           // Instantiate subGroupId as an ObjectId
  //           const subGroupIdObject = new mongoose.Types.ObjectId(subGroupId);

  //           subGroupExists = group.basicCustomization.subLearnerGroup.subLearnerGroups.some(subGroup => {
  //             // Convert subGroup._id to ObjectId if it's a string
  //             const subGroupId = new mongoose.Types.ObjectId(subGroup._id);
  //             return subGroupId.equals(subGroupIdObject);
  //         });

  //           if (!subGroupExists) {
  //               return res.status(400).json({ message: "Sub-learner group not found in the specified group" });
  //           }
  //       }

  //         // Validate and add each user to the group
  //         const userValidationResults = await Promise.all(userId.map(async (id: any) => {
  //             const user = await User.findById(id);
  //             if (!user) {
  //                 return { userId: id, error: "User not found" };
  //             }
  //             if (!user.organizationId || user.organizationId.toString() !== adminOrganizationId.toString()) {
  //                 return { userId: id, error: "User does not belong to your organization" };
  //             }

  //             // Add user to the group
  //             if (!user.groups?.includes(groupId)) {
  //                 user.groups = user.groups ? [...user.groups, groupId] : [groupId];
  //             }

  //             // Optionally add user to the sub-learner group
  //             if (subGroupId && !user.subLearnerGroups?.includes(subGroupId)) {
  //                 user.subLearnerGroups = user.subLearnerGroups
  //                     ? [...user.subLearnerGroups, subGroupId]
  //                     : [subGroupId];
  //             }

  //             // Save updated user
  //             await user.save();
  //             return { userId: id, success: true };
  //         }));

  //         // Check for errors in user validation
  //         const errors = userValidationResults.filter(result => result.error);
  //         if (errors.length > 0) {
  //             return res.status(400).json({ message: "User validation failed", errors });
  //         }

  //         res.status(200).json({
  //             message: "Users successfully assigned to group",
  //             data: {
  //                 userIds: userId,
  //                 groupId,
  //                 subGroupId,
  //             },
  //         });
  //     } catch (error) {
  //         console.error("Error assigning user to group:", error);
  //         res.status(500).json({ message: "An error occurred while assigning user to group" });
  //     }
  // }

  async assignUsersToGroup(req: Request, res: Response) {
    try {
      const { groupId, subLearnerGroupId, userIds } = req.body;
      const adminId = req.admin._id;

      if (!groupId || !Array.isArray(userIds) || userIds.length === 0) {
        return ResponseHandler.failure(
          res,
          "Invalid input data. Provide groupId and userIds.",
          400
        );
      }

      // Check if the group exists and belongs to the admin's organization
      const group = await Group.findOne({
        _id: groupId,
        organizationId: adminId,
      });

      if (!group) {
        return ResponseHandler.failure(
          res,
          "Group not found or does not belong to your organization.",
          404
        );
      }

      // If a sub-learner group is provided, check if it exists within the group
      if (subLearnerGroupId) {
        const subGroup =
          group.basicCustomization.subLearnerGroup.subLearnerGroups.find(
            (subGroup) => subGroup._id?.toString() === subLearnerGroupId
          );

        if (!subGroup) {
          return ResponseHandler.failure(
            res,
            "Sub-learner group not found in the specified group.",
            404
          );
        }
      }

      // Check if all users exist and belong to the admin's organization
      const users = await User.find({
        _id: { $in: userIds },
        organizationId: group.organizationId,
      });

      if (users.length !== userIds.length) {
        return ResponseHandler.failure(
          res,
          "One or more users not found or do not belong to your organization.",
          404
        );
      }

      // Update the users to add them to the group and optionally the sub-learner group
      const updatePromises = userIds.map(async (userId) => {
        const user = await User.findById(userId);

        if (!user) {
          return; // Skip if user doesn't exist
        }

        const updateFields: any = {};

        // Ensure `groups` and `subLearnerGroups` fields are defined
        user.groups = user.groups || [];
        user.subLearnerGroups = user.subLearnerGroups || [];

        // Add groupId if it's not already in the user's `groups` field
        if (!user.groups.includes(groupId)) {
          updateFields.$addToSet = {
            ...updateFields.$addToSet,
            groups: groupId,
          };
        }

        // Add subLearnerGroupId if it's not already in the user's `subLearnerGroups` field
        if (
          subLearnerGroupId &&
          !user.subLearnerGroups.includes(subLearnerGroupId)
        ) {
          updateFields.$addToSet = {
            ...updateFields.$addToSet,
            subLearnerGroups: subLearnerGroupId,
          };
        }

        // Only update the user if there are fields to update
        if (Object.keys(updateFields).length > 0) {
          await User.updateOne({ _id: userId }, updateFields);
        }
      });

      await Promise.all(updatePromises);

      return ResponseHandler.success(
        res,
        { groupId, subLearnerGroupId, assignedUsers: userIds },
        "Users successfully assigned to the group.",
        200
      );
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        `Server error: ${error.message}`,
        500
      );
    }
  }
}
