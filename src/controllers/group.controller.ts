import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
// import Group from "../models/group.model";
import Group, { ISubGroup } from "../models/group.model";
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
      return ResponseHandler.failure(
        res,
        error.message || "Error creating group"
      );
    }
  }

  async editGroup(req: Request, res: Response) {
    try {
      const { groupId } = req.params;
      const { name, numberOfArms, subGroups } = req.body;
      const organizationId = req.admin._id;

      const group = await Group.findOne({ _id: groupId, organizationId });
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
      return ResponseHandler.failure(
        res,
        error.message || "Error editing group"
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

  // async addUsersToGroup(req: Request, res: Response) {
  //   try {
  //     const { groupId, subGroupId } = req.params;
  //     const { userIds } = req.body;
  //     const organizationId = req.admin._id;

  //     // Find the group by its ID
  //     const group = await Group.findById(groupId);
  //     if (!group) {
  //       return ResponseHandler.failure(res, "Group not found", 404);
  //     }

  //     // Ensure members array is initialized
  //     group.members = group.members ?? [];

  //     // Find the users by their IDs and ensure they belong to the same organization
  //     const users = await User.find({
  //       _id: { $in: userIds },
  //       organizationId,
  //     });

  //     if (users.length !== userIds.length) {
  //       return ResponseHandler.failure(
  //         res,
  //         "Some users do not belong to this organization",
  //         400
  //       );
  //     }

  //     if (subGroupId) {
  //       // Find the subgroup by its ID
  //       const subGroup = group.subGroups.find(
  //         (sub) => sub._id?.toString() === subGroupId
  //       );

  //       if (!subGroup) {
  //         return ResponseHandler.failure(res, "Subgroup not found", 404);
  //       }

  //       // Add users to the subgroup's members array
  //       users.forEach((user) => {
  //         const userId = user._id as mongoose.Types.ObjectId;
  //         if (!subGroup.members.includes(userId)) {
  //           subGroup.members.push(userId);
  //         }
  //       });
  //     } else {
  //       // Add users to the group's members array
  //       users.forEach((user) => {
  //         if (user._id && group.members) {
  //           // Ensure group.members is initialized if it's undefined
  //           if (!group.members.includes(user._id as mongoose.Types.ObjectId)) {
  //             group.members.push(user._id as mongoose.Types.ObjectId);
  //           }
  //         } else {
  //           // Initialize members if it's undefined
  //           if (!group.members) {
  //             group.members = [];
  //           }
  //           // Add the user to the group
  //           group.members.push(user._id as mongoose.Types.ObjectId);
  //         }
  //       });
  //     }

  //     // Save the updated group
  //     await group.save();

  //     return ResponseHandler.success(
  //       res,
  //       group,
  //       "Users added to group successfully"
  //     );
  //   } catch (error: any) {
  //     return ResponseHandler.failure(
  //       res,
  //       error.message || "Error adding users to group"
  //     );
  //   }
  // }

  async addUsersToGroup(req: Request, res: Response) {
    try {
      const { id } = req.params; // Single ID is passed
      const { userIds } = req.body;
      const organizationId = req.admin._id;
  
      // Check if the ID corresponds to a group
      const group = await Group.findById(id);
      if (group) {
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
  
        // Add users to the group's members array
        users.forEach((user) => {
          const userId = user._id as mongoose.Types.ObjectId;
          if (!group.members.includes(userId)) {
            group.members.push(userId);
          }
        });
  
        // Save the updated group
        await group.save();
  
        return ResponseHandler.success(
          res,
          group,
          "Users added to group successfully"
        );
      }
  
      // If not a group, check if it corresponds to a subgroup
      const parentGroup = await Group.findOne({ "subGroups._id": id });
      if (!parentGroup) {
        return ResponseHandler.failure(res, "Group or Subgroup not found", 404);
      }
  
      // Find the specific subgroup
      const subGroup = parentGroup.subGroups.find(
        (sub) => sub._id?.toString() === id
      );
      if (!subGroup) {
        return ResponseHandler.failure(res, "Subgroup not found", 404);
      }
  
      // Ensure subgroup's members array is initialized
      subGroup.members = subGroup.members ?? [];
  
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
  
      // Add users to the subgroup's members array
      users.forEach((user) => {
        const userId = user._id as mongoose.Types.ObjectId;
        if (!subGroup.members.includes(userId)) {
          subGroup.members.push(userId);
        }
      });
  
      // Save the updated parent group
      await parentGroup.save();
  
      return ResponseHandler.success(
        res,
        parentGroup,
        "Users added to subgroup successfully"
      );
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        error.message || "Error adding users to group or subgroup"
      );
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
  
      const courseDetails = {
        courseId: new mongoose.Types.ObjectId(courseId),
        courseName: course.title,
      };
  
      // Determine if the ID corresponds to a group or a subgroup
      const group = await Group.findOne({
        _id: groupId,
        organizationId: adminId,
      });
  
      let members: mongoose.Types.ObjectId[] = [];
      if (group) {
        // It's a group
        members = group.members;
  
        // Include all subgroup members
        group.subGroups.forEach((subGroup: ISubGroup) => {
          members.push(...subGroup.members);
        });
  
        // Add course details to the group's assignedCourses
        group.assignedCourses = group.assignedCourses || [];
        if (!group.assignedCourses.some(c => c.courseId.toString() === courseId)) {
          group.assignedCourses.push(courseDetails);
          await group.save();
        }
      } else {
        // Check if it's a subgroup
        const subgroupParent = await Group.findOne({
          "subGroups._id": groupId,
          organizationId: adminId,
        });
  
        if (!subgroupParent) {
          return ResponseHandler.failure(res, "Group or Subgroup not found", 404);
        }
  
        // Find the specific subgroup
        const subGroup = subgroupParent.subGroups.find(
          (sg: ISubGroup) => sg._id.toString() === groupId
        );
        if (!subGroup) {
          return ResponseHandler.failure(res, "Subgroup not found", 404);
        }
  
        members = subGroup.members;
  
        // Add course details to the subgroup's assignedCourses
        subGroup.assignedCourses = subGroup.assignedCourses || [];
        if (!subGroup.assignedCourses.some(c => c.courseId.toString() === courseId)) {
          subGroup.assignedCourses.push(courseDetails);
          await subgroupParent.save();
        }
      }
  
      if (members.length === 0) {
        return ResponseHandler.failure(
          res,
          "No users found in the specified group or subgroup",
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
          _id: { $in: members },
          $or: [{ unattemptedPrograms: { $exists: false } }],
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
      // const bulkUpdates = members.map((userId) => ({
      //   updateOne: {
      //     filter: {
      //       _id: userId,
      //       $or: [
      //         { "assignedPrograms.courseId": { $ne: courseId } }, // Check if courseId is not already present
      //         { "assignedPrograms": { $exists: false } }, // Handle users without assignedPrograms
      //       ],
      //     },
      //     update: {
      //       $push: {
      //         assignedPrograms: {
      //           courseId: new mongoose.Types.ObjectId(courseId),
      //           dueDate: new Date(dueDate),
      //           status,
      //           amount: course.cost || 0,
      //         },
      //         unattemptedPrograms: {
      //           course: sanitizedCourse,
      //           status,
      //         },
      //       },
      //     },
      //   },
      // }));  

      const bulkUpdates = members.map((userId) => ({
        updateOne: {
          filter: {
            _id: userId,
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
  
      const learnersToAdd = members.map((userId) => ({
        userId,
        progress: 0,
      }));
  
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
        "Course assigned successfully",
        200
      );
    } catch (error: any) {
      console.error("Error assigning course to group/subgroup:", error.message);
      return ResponseHandler.failure(
        res,
        `Server error: ${error.message}`,
        500
      );
    }
  }
}
