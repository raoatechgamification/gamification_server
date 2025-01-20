import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
// import Group from "../models/group.model";
import Group from "../models/groupp.model";
import User, { IUser } from "../models/user.model";
import Course from "../models/course.model";
import { ResponseHandler } from "../middlewares/responseHandler.middleware";

export class GroupController {
  async createGroup(req: Request, res: Response) {
    try {
      const { name, numberOfArms, subGroups, members } = req.body;
      const organizationId = req.admin._id;
  
      // Validate that `numberOfArms` matches subgroups length (if subgroups exist)
      if (subGroups && numberOfArms !== subGroups.length) {
        return ResponseHandler.failure(
          res,
          "Number of arms must match the number of subgroups",
          400
        );
      }
  
      const group = new Group({
        name,
        numberOfArms,
        subGroups: subGroups
          ? subGroups.map((subGroup: { name: string }) => ({
              name: subGroup.name,
              members: [],
            }))
          : [],
        members: members || [], // Set members directly for the group
        organizationId,
      });
  
      await group.save();
      return ResponseHandler.success(res, group, "Group created successfully");
    } catch (error: any) {
      return ResponseHandler.failure(res, error.message || "Error creating group");
    }
  }
  
  // async createGroup(req: Request, res: Response) {
  //   try {
  //     const {
  //       name,
  //       generalLearnerTerm,
  //       generalLearnerGroupTerm,
  //       groups,
  //       generalSubLearnerGroupTerm,
  //       subGroupsName,
  //       generalInstructorTerm,
  //       instructorNames,
  //       numberOfArms,
  //       maxMembersPerProgram,
  //       idFormat,
  //       personalization,
  //     } = req.body;

  //     const organizationId = req.admin._id;

  //     const newGroup = new Group({
  //       name,
  //       organizationId,
  //       numberOfArms,
  //       basicCustomization: {
  //         generalLearnerTerm,
  //         learnerGroup: {
  //           generalLearnerGroupTerm,
  //           groups,
  //         },
  //         subLearnerGroup: {
  //           generalSubLearnerGroupTerm,
  //           subLearnerGroups: subGroupsName.map((subGroupName: string) => ({
  //             name: subGroupName,
  //           })),
  //         },
  //         instructor: {
  //           generalInstructorTerm,
  //           names: instructorNames.map((name: string) => ({ name })),
  //         },
  //       },
  //       advancedCustomization: {
  //         academicProgram: {
  //           maxMembersPerProgram,
  //         },
  //         idFormat,
  //         personalization,
  //       },
  //     });

  //     const savedGroup = await newGroup.save();

  //     return ResponseHandler.success(
  //       res,
  //       savedGroup,
  //       "Group created successfully"
  //     );
  //   } catch (error: any) {
  //     return ResponseHandler.failure(
  //       res,
  //       `Server error: ${error.message}`,
  //       500
  //     );
  //   }
  // }

  

  // async editGroup(req: Request, res: Response) {
  //   try {
  //     const { groupId } = req.params;
  //     const {
  //       name,
  //       generalLearnerTerm,
  //       generalLearnerGroupTerm,
  //       groups,
  //       generalSubLearnerGroupTerm,
  //       subGroupsName,
  //       generalInstructorTerm,
  //       instructorNames,
  //       maxMembersPerProgram,
  //       idFormat,
  //       personalization,
  //     } = req.body;

  //     const organizationId = req.admin._id;

  //     const group = await Group.findOne({ _id: groupId, organizationId });
  //     if (!group) {
  //       return ResponseHandler.failure(
  //         res,
  //         "Group not found or does not belong to your organization",
  //         404
  //       );
  //     }

  //     const updatedGroup = await Group.findByIdAndUpdate(
  //       groupId,
  //       {
  //         $set: {
  //           name,
  //           "basicCustomization.generalLearnerTerm": generalLearnerTerm,
  //           "basicCustomization.learnerGroup.generalLearnerGroupTerm":
  //             generalLearnerGroupTerm,
  //           "basicCustomization.learnerGroup.groups": groups,
  //           "basicCustomization.subLearnerGroup.generalSubLearnerGroupTerm":
  //             generalSubLearnerGroupTerm,
  //           "basicCustomization.subLearnerGroup.subLearnerGroups":
  //             subGroupsName.map((subGroupName: string) => ({
  //               name: subGroupName,
  //             })),
  //           "basicCustomization.instructor.generalInstructorTerm":
  //             generalInstructorTerm,
  //           "basicCustomization.instructor.names": instructorNames.map(
  //             (name: string) => ({
  //               name,
  //             })
  //           ),
  //           "advancedCustomization.academicProgram.maxMembersPerProgram":
  //             maxMembersPerProgram,
  //           "advancedCustomization.idFormat": idFormat,
  //           "advancedCustomization.personalization": personalization,
  //         },
  //       },
  //       { new: true, runValidators: true }
  //     );

  //     if (!updatedGroup) {
  //       return ResponseHandler.failure(res, "Group not found", 404);
  //     }

  //     return ResponseHandler.success(
  //       res,
  //       updatedGroup,
  //       "Group updated successfully"
  //     );
  //   } catch (error: any) {
  //     return ResponseHandler.failure(
  //       res,
  //       `Server error: ${error.message}`,
  //       500
  //     );
  //   }
  // }

  async editGroup(req: Request, res: Response) {
    try {
      const { groupId } = req.params;
      const { name, numberOfArms, subGroups } = req.body;
  
      const group = await Group.findById(groupId);
      if (!group) {
        return ResponseHandler.failure(
          res,
          "Group not found or does not belong to your organization.",
          404
        );
      }
  
      if (numberOfArms !== subGroups.length) {
        return ResponseHandler.failure(
          res,
          "Number of arms must match the number of subgroups",
          400
        );
      }
  
      group.name = name;
      group.numberOfArms = numberOfArms;
      group.subGroups = subGroups.map((subGroup: { name: string }) => ({
        name: subGroup.name,
        members: [],
      })); // Correctly map the array of objects
  
      await group.save();
      return ResponseHandler.success(res, group, "Group updated successfully");
    } catch (error: any) {
      return ResponseHandler.failure(res, error.message || "Error editing group");
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

  // async assignUsersToGroup(req: Request, res: Response) {
  //   try {
  //     const { groupId, subLearnerGroupId, userIds } = req.body;
  //     const adminId = req.admin._id;

  //     if (!groupId || !Array.isArray(userIds) || userIds.length === 0) {
  //       return ResponseHandler.failure(
  //         res,
  //         "Invalid input data. Provide groupId and userIds.",
  //         400
  //       );
  //     }

  //     const group = await Group.findOne({
  //       _id: groupId,
  //       organizationId: adminId,
  //     });

  //     if (!group) {
        // return ResponseHandler.failure(
        //   res,
        //   "Group not found or does not belong to your organization.",
        //   404
        // );
  //     }

  //     if (subLearnerGroupId) {
  //       const subGroup =
  //         group.basicCustomization.subLearnerGroup.subLearnerGroups.find(
  //           (subGroup) => subGroup._id?.toString() === subLearnerGroupId
  //         );

  //       if (!subGroup) {
  //         return ResponseHandler.failure(
  //           res,
  //           "Sub-learner group not found in the specified group.",
  //           404
  //         );
  //       }
  //     }

  //     const users = await User.find({
  //       _id: { $in: userIds },
  //       organizationId: group.organizationId,
  //     });

  //     if (users.length !== userIds.length) {
  //       return ResponseHandler.failure(
  //         res,
  //         "One or more users not found or do not belong to your organization.",
  //         404
  //       );
  //     }

  //     // Update the users to add them to the group and optionally the sub-learner group
  //     const updatePromises = userIds.map(async (userId) => {
  //       const user = await User.findById(userId);

  //       if (!user) {
  //         return; // Skip if user doesn't exist
  //       }

  //       const updateFields: any = {};

  //       // Ensure `groups` and `subLearnerGroups` fields are defined
  //       user.groups = user.groups || [];
  //       user.subLearnerGroups = user.subLearnerGroups || [];

  //       // Add groupId if it's not already in the user's `groups` field
  //       if (!user.groups.includes(groupId)) {
  //         updateFields.$addToSet = {
  //           ...updateFields.$addToSet,
  //           groups: groupId,
  //         };
  //       }

  //       // Add subLearnerGroupId if it's not already in the user's `subLearnerGroups` field
  //       if (
  //         subLearnerGroupId &&
  //         !user.subLearnerGroups.includes(subLearnerGroupId)
  //       ) {
  //         updateFields.$addToSet = {
  //           ...updateFields.$addToSet,
  //           subLearnerGroups: subLearnerGroupId,
  //         };
  //       }

  //       // Only update the user if there are fields to update
  //       if (Object.keys(updateFields).length > 0) {
  //         await User.updateOne({ _id: userId }, updateFields);
  //       }
  //     });

  //     await Promise.all(updatePromises);

  //     return ResponseHandler.success(
  //       res,
  //       { groupId, subLearnerGroupId, assignedUsers: userIds },
  //       "Users successfully assigned to the group.",
  //       200
  //     );
  //   } catch (error: any) {
  //     return ResponseHandler.failure(
  //       res,
  //       `Server error: ${error.message}`,
  //       500
  //     );
  //   }
  // }

  async addUsersToGroupp(req: Request, res: Response) {
    try {
      const { groupId } = req.params;
      const { userIds } = req.body;
      const organizationId = req.admin._id;
  
      const group = await Group.findById(groupId);
      if (!group) {
        return ResponseHandler.failure(res, "Group not found", 404);
      }
  
      const users = await User.find({
        _id: { $in: userIds },
        organizationId,
      });
  
      if (users.length !== userIds.length) {
        return ResponseHandler.failure(
          res,
          "Some users do not belong to this organization",
          400
        );
      }
  
      // Add users to the group-level members array
      if (!group.members) {
        group.members = []; // Initialize if undefined
      }
      
      group.members.push(...users.map((user) => user._id as mongoose.Schema.Types.ObjectId)); // Cast to ObjectId
      await group.save();
      
      return ResponseHandler.success(res, group, "Users added to group successfully");
    } catch (error: any) {
      return ResponseHandler.failure(res, error.message || "Error adding users to group");
    }
  }  

  // async addUsersToGroup(req: Request, res: Response) {
  //   try {
  //     const { groupId, subGroupId } = req.params; // Extract groupId and subGroupId from the request
  //     const { userIds } = req.body;
  //     const organizationId = req.admin._id;
  
  //     // Find the group by its ID
  //     const group = await Group.findById(groupId);
  //     if (!group) {
  //       return ResponseHandler.failure(res, "Group not found", 404);
  //     }
  
  //     // Find the users by their IDs and ensure they belong to the same organization
  //     const users = await User.find({
  //       _id: { $in: userIds },
  //       organizationId,
  //     });
  
  //     // Check if some users do not belong to the organization
  //     if (users.length !== userIds.length) {
  //       return ResponseHandler.failure(
  //         res,
  //         "Some users do not belong to this organization",
  //         400
  //       );
  //     }
  
  //     if (subGroupId) {
  //       // If a subGroupId is provided, validate the subgroup
  //       const subGroup = group.subGroups.find((sub) => sub._id?.toString() === subGroupId);
  
  //       if (!subGroup) {
  //         return ResponseHandler.failure(res, "Subgroup not found", 404);
  //       }
  
  //       // Add users to the subgroup's members array if they are not already present
  //       users.forEach((user) => {
  //         if (!subGroup.members.includes(user.id)) {
  //           subGroup.members.push(user._id as mongoose.Schema.Types.ObjectId);
  //         }
  //       });
  //     } else {
  //       // If no subGroupId is provided, add users to the group's members array
  //       if (!group.members) {
  //         group.members = []; // Initialize if undefined
  //       }
  
  //       users.forEach((user) => {
  //         if (!group.members.includes(user.id)) {
  //           group.members.push(user._id as mongoose.Schema.Types.ObjectId);
  //         }
  //       });
  //     }
  
  //     // Save the updated group
  //     await group.save();
  
  //     return ResponseHandler.success(res, group, "Users added to group successfully");
  //   } catch (error: any) {
  //     return ResponseHandler.failure(res, error.message || "Error adding users to group");
  //   }
  // }  

  async addUsersToGroup(req: Request, res: Response) {
    try {
      const { groupId, subGroupId } = req.params;
      const { userIds } = req.body;
      const organizationId = req.admin._id;
  
      // Find the group by its ID
      const group = await Group.findById(groupId);
      if (!group) {
        return ResponseHandler.failure(res, "Group not found", 404);
      }
  
      // Ensure members array is initialized
      group.members = group.members ?? [];
  
      // Find the users by their IDs and ensure they belong to the same organization
      const users = await User.find({
        _id: { $in: userIds },
        organizationId,
      });
  
      if (users.length !== userIds.length) {
        return ResponseHandler.failure(
          res,
          "Some users do not belong to this organization",
          400
        );
      }
  
      if (subGroupId) {
        // Find the subgroup by its ID
        const subGroup = group.subGroups.find(
          (sub) => sub._id?.toString() === subGroupId
        );
  
        if (!subGroup) {
          return ResponseHandler.failure(res, "Subgroup not found", 404);
        }
  
        // Add users to the subgroup's members array
        users.forEach((user) => {
          const userId = user._id as mongoose.Schema.Types.ObjectId;
          if (!subGroup.members.includes(userId)) {
            subGroup.members.push(userId);
          }
        });
      } else {
        // Add users to the group's members array
        users.forEach((user) => {
          if (user._id && group.members) {
            // Ensure group.members is initialized if it's undefined
            if (!group.members.includes(user._id as mongoose.Schema.Types.ObjectId)) {
              group.members.push(user._id as mongoose.Schema.Types.ObjectId);
            }
          } else {
            // Initialize members if it's undefined
            if (!group.members) {
              group.members = [];
            }
            // Add the user to the group
            group.members.push(user._id as mongoose.Schema.Types.ObjectId);
          }
        });
      }
  
      // Save the updated group
      await group.save();
  
      return ResponseHandler.success(res, group, "Users added to group successfully");
    } catch (error: any) {
      return ResponseHandler.failure(res, error.message || "Error adding users to group");
    }
  }
  
  async addUsersToGroupo(req: Request, res: Response) {
    try {
      const { groupId, subGroupName } = req.params; // Extract groupId and subGroupName from the request
      const { userIds } = req.body;
      const organizationId = req.admin._id;
  
      // Find the group by its ID
      const group = await Group.findById(groupId);
      if (!group) {
        return ResponseHandler.failure(res, "Group not found", 404);
      }
  
      // Find the users by their IDs and ensure they belong to the same organization
      const users = await User.find({
        _id: { $in: userIds },
        organizationId,
      });
  
      // Check if some users do not belong to the organization
      if (users.length !== userIds.length) {
        return ResponseHandler.failure(
          res,
          "Some users do not belong to this organization",
          400
        );
      }
  
      // If a subGroupName is provided, check if the subgroup exists and add users there
      if (subGroupName) {
        const subGroup = group.subGroups.find((sub) => sub.name === subGroupName);
  
        if (!subGroup) {
          return ResponseHandler.failure(res, "Subgroup not found", 404);
        }
  
        // Add users to the subgroup's members array if they are not already present
        // users.forEach((user) => {
        //   if (!subGroup.members.includes(user._id)) {
        //     subGroup.members.push(user._id as mongoose.Schema.Types.ObjectId);
        //   }
        // });
        
        users.forEach((user) => {
          if (user._id && group.members) {
            // Ensure group.members is initialized if it's undefined
            if (!group.members.includes(user._id as mongoose.Schema.Types.ObjectId)) {
              group.members.push(user._id as mongoose.Schema.Types.ObjectId);
            }
          } else {
            // Initialize members if it's undefined
            if (!group.members) {
              group.members = [];
            }
            // Add the user to the group
            group.members.push(user._id as mongoose.Schema.Types.ObjectId);
          }
        });
        
  
      } else {
        // If no subgroup name is provided, add users to the group's members array
        if (!group.members) {
          group.members = []; // Initialize if undefined
        }

        users.forEach((user) => {
          if (user._id && group.members) {
            // Ensure group.members is initialized if it's undefined
            if (!group.members.includes(user._id as mongoose.Schema.Types.ObjectId)) {
              group.members.push(user._id as mongoose.Schema.Types.ObjectId);
            }
          } else {
            // Initialize members if it's undefined
            if (!group.members) {
              group.members = [];
            }
            // Add the user to the group
            group.members.push(user._id as mongoose.Schema.Types.ObjectId);
          }
        });
        
      }
  
      // Save the updated group
      await group.save();
  
      return ResponseHandler.success(res, group, "Users added to group successfully");
    } catch (error: any) {
      return ResponseHandler.failure(res, error.message || "Error adding users to group");
    }
  }
  
  
  async assignCourseToGroup(req: Request, res: Response) {
    try {
      const { groupId, dueDate } = req.body;
      const { courseId } = req.params;
      const adminId = req.admin._id;
  
      // Fetch course details
      const course = await Course.findById(courseId).lean();
      if (!course) {
        return ResponseHandler.failure(res, "Course not found", 404);
      }
  
      // Find users belonging to the group
      const usersInGroup = await User.find({
        groups: groupId,
        organizationId: adminId,
      });
  
      if (usersInGroup.length === 0) {
        return ResponseHandler.failure(
          res,
          "No users found in the specified group or group does not exist",
          404
        );
      }
  
      let status = "unpaid";
      if (!course.cost || course.cost === 0) {
        status = "free";
      }
  
      const sanitizedCourse = { ...course };
      delete sanitizedCourse.assignedLearnerIds;
      delete sanitizedCourse.learnerIds;
  
      // Initialize program fields for users without them
      await User.updateMany(
        {
          _id: { $in: usersInGroup.map((user) => user._id) },
          $or: [
            { unattemptedPrograms: { $exists: false } },
          ],
        },
        {
          $set: {
            ongoingPrograms: [],
            completedPrograms: [],
            unattemptedPrograms: [],
          },
        }
      );
  
      // Prepare bulk updates for assigning the course to users
      const bulkUpdates = usersInGroup.map((user) => ({
        updateOne: {
          filter: {
            _id: user._id,
            "assignedPrograms.courseId": { $ne: courseId },
          },
          update: {
            $push: {
              assignedPrograms: {
                courseId: new mongoose.Types.ObjectId(courseId),
                dueDate: new Date(dueDate),
                status,
                amount: course.cost,
              },
              unattemptedPrograms: {
                course: sanitizedCourse,
                status,
              },
            },
          },
        },
      }));
  
      const result = await User.bulkWrite(bulkUpdates);
  
      const learnersToAdd = usersInGroup.map((user) => ({
        userId: user._id,
        progress: 0,
      }));
  
      // Update course to reflect new learners
      const updateQuery: any = {
        $addToSet: {
          learnerIds: { $each: learnersToAdd },
        },
      };
  
      if (status === "free") {
        updateQuery.$addToSet["learnerIds"] = { $each: learnersToAdd };
      }
  
      await Course.updateOne({ _id: courseId }, updateQuery);
  
      return ResponseHandler.success(
        res,
        {
          matchedCount: result.matchedCount,
          modifiedCount: result.modifiedCount,
          upsertedCount: result.upsertedCount,
        },
        "Course assigned to group successfully",
        200
      );
    } catch (error: any) {
      console.error("Error assigning course to group:", error.message);
      return ResponseHandler.failure(
        res,
        `Server error: ${error.message}`,
        500
      );
    }
  }
  
}
