import { Request, Response } from "express";
import mongoose from "mongoose"; // Ensure this is imported if not already
import { ResponseHandler } from "../middlewares/responseHandler.middleware";
import AssignedBill from "../models/assignedBill.model";
import Course from "../models/course.model";
import Group from "../models/group.model";
import Organization from "../models/organization.model";
import Payment from "../models/payment.model";
import Submission from "../models/submission.model";
import User from "../models/user.model";
import { uploadToCloudinary } from "../utils/cloudinaryUpload";
import { getOrganizationId } from "../utils/getOrganizationId.util";
import { hashPassword } from "../utils/hash";

class AdminController {
  // async viewAllUsers(req: Request, res: Response) {
  //   try {
  //     let organizationId = await getOrganizationId(req, res);
  //     if (!organizationId) {
  //       return;
  //     }

  //     const organization = await Organization.findById(organizationId);
  //     if (!organization) {
  //       return ResponseHandler.failure(res, "Organization not found", 400);
  //     }

  //     const users = await User.find({ organizationId })
  //       .select("-password")
  //       .populate([
  //         { path: "groups", select: "name" },
  //         { path: "subGroups", select: "name" },
  //       ]);

  //     if (!users || users.length === 0) {
  //       return ResponseHandler.failure(
  //         res,
  //         "You have no users under your organization, start by creating users",
  //         400
  //       );
  //     }

  //     const usersWithDetails = await Promise.all(
  //       users.map(async (user) => {
  //         const paymentHistory = await Payment.find({ userId: user._id });
  //         const assignedBills = await AssignedBill.find({
  //           assigneeId: user._id,
  //         });
  //         return {
  //           ...user.toObject(),
  //           groups: user.groups,
  //           subGroups: user.subGroups,
  //           paymentHistory,
  //           assignedBills,
  //         };
  //       })
  //     );

  //     return ResponseHandler.success(
  //       res,
  //       usersWithDetails,
  //       "Users fetched successfully"
  //     );
  //   } catch (error: any) {
  //     return ResponseHandler.failure(
  //       res,
  //       `Server error: ${error.message}`,
  //       500
  //     );
  //   }
  // }

  async viewAllUsers(req: Request, res: Response) {
    try {
      let organizationId = await getOrganizationId(req, res);
      if (!organizationId) {
        return;
      }

      const organization = await Organization.findById(organizationId);
      if (!organization) {
        return ResponseHandler.failure(res, "Organization not found", 400);
      }

      const users = await User.find({ organizationId })
        .select("-password")
        .sort({ createdAt: -1 }) 
        .populate([{ path: "groups", select: "name" }]);

      if (!users || users.length === 0) {
        return ResponseHandler.failure(
          res,
          "You have no users under your organization, start by creating users",
          400
        );
      }

      const usersWithDetails = await Promise.all(
        users.map(async (user) => {
          const populatedGroups = await Promise.all(
            (user.groups || []).map(async (groupId) => {
              const group =
                await Group.findById(groupId).select("name subGroups");

              if (group) {
                // Make sure subGroups is an array of ObjectId
                const userSubGroups = user.subGroups || [];

                return {
                  ...group.toObject(),
                  subGroups: group.subGroups.filter((subGroup) =>
                    userSubGroups.some(
                      (userSubGroup) => userSubGroup.equals(subGroup._id) // Compare ObjectId with ObjectId
                    )
                  ),
                };
              }
              return null;
            })
          );

          const paymentHistory = await Payment.find({ userId: user._id });
          const assignedBills = await AssignedBill.find({
            assigneeId: user._id,
          });

          return {
            ...user.toObject(),
            groups: populatedGroups.filter((g) => g !== null), // Filter out null groups
            subGroups: populatedGroups
              .flatMap((group) => group?.subGroups || [])
              .map((subGroup) => ({
                _id: subGroup._id,
                name: subGroup.name,
              })),
            paymentHistory,
            assignedBills,
          };
        })
      );

      return ResponseHandler.success(
        res,
        usersWithDetails,
        "Users fetched successfully"
      );
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        `Server error: ${error.message}`,
        500
      );
    }
  }

  async viewAllUserss(req: Request, res: Response) {
    try {
      // const organizationId = req.admin._id;

      let organizationId = await getOrganizationId(req, res);
      if (!organizationId) {
        return;
      }

      const organization = await Organization.findById(organizationId);
      if (!organization) {
        return ResponseHandler.failure(res, "Organization not found", 400);
      }

      const users = await User.find({ organizationId }).select("-password");

      if (!users || users.length === 0) {
        return ResponseHandler.failure(
          res,
          "You have no users under your organization, start by creating users",
          400
        );
      }

      const usersWithDetails = await Promise.all(
        users.map(async (user) => {
          const paymentHistory = await Payment.find({ userId: user._id });
          const assignedBills = await AssignedBill.find({
            assigneeId: user._id,
          });
          return { ...user.toObject(), paymentHistory, assignedBills };
        })
      );

      return ResponseHandler.success(
        res,
        usersWithDetails,
        "Users fetched successfully"
      );
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        `Server error: ${error.message}`,
        500
      );
    }
  }

  async editUserProfilee(req: Request, res: Response) {
    try {
      console.log("a");
      const organizationId = await getOrganizationId(req, res);
      if (!organizationId) {
        return;
      }

      const organization = await Organization.findById(organizationId);
      if (!organization) {
        return ResponseHandler.failure(res, "Organization not found", 400);
      }
      console.log("b");

      const image = req.file; // Uploaded image
      console.log("c");
      const userId = req.params.userId;
      console.log("d");
      // Parse `ids` from the form-data
      const { ids = "[]", ...rest } = req.body; // Default to empty array if not provided
      let parsedIds: string[] = [];
      console.log("e");
      try {
        parsedIds = JSON.parse(ids); // Parse `ids` into an array
      } catch (error) {
        return ResponseHandler.failure(res, "Invalid 'ids' format", 400);
      }
      console.log("f");

      // Ensure all IDs are converted to ObjectId
      const objectIds = parsedIds.map(
        (id: string) => new mongoose.Types.ObjectId(id)
      );
      console.log("g");

      // Fetch the user and ensure they belong to the organization
      let user = await User.findOne({ _id: userId, organizationId });
      if (!user) {
        return ResponseHandler.failure(
          res,
          "User not found in your organization",
          404
        );
      }
      console.log("h");
      let fileUploadResult: any = null;
      console.log("g");
      if (image) {
        fileUploadResult = await uploadToCloudinary(
          image.buffer,
          image.mimetype,
          "userDisplayPictures"
        );
      }
      console.log("i");

      // Initialize variables for updates
      let updatedGroups: mongoose.Types.ObjectId[] = user.groups || [];
      console.log("j");
      let updatedSubGroups: mongoose.Types.ObjectId[] = user.subGroups || [];
      console.log("k");
      const bulkGroupOps: any[] = [];
      console.log("l");
      for (const id of objectIds) {
        const userIdObject = new mongoose.Types.ObjectId(userId);

        // Check if the ID belongs to a group
        const group = await Group.findOne({
          _id: id,
          organizationId,
        });

        if (group) {
          if (!group.members) {
            group.members = []; // Initialize as an empty array if undefined
          }

          // Add user to the group's members if not already a member
          if (
            !group.members.some((memberId) => memberId.equals(userIdObject))
          ) {
            group.members.push(userIdObject);
            bulkGroupOps.push({
              updateOne: {
                filter: { _id: group._id },
                update: { members: group.members },
              },
            });
          }

          // Add group ID to user's groups if not already added
          if (!updatedGroups.some((groupId) => groupId.equals(group._id))) {
            updatedGroups.push(group._id);
          }
          continue;
        }
        console.log("m");

        // Check if the ID belongs to a subgroup
        const groupWithSubgroup = await Group.findOne({
          "subGroups._id": id,
          organizationId,
        });
        console.log("n");

        if (groupWithSubgroup) {
          const subgroup = groupWithSubgroup.subGroups.find((subGroup) =>
            subGroup._id.equals(id)
          );

          if (subgroup) {
            // Add user to the subgroup's members if not already a member
            if (
              !subgroup.members.some((memberId) =>
                memberId.equals(userIdObject)
              )
            ) {
              subgroup.members.push(userIdObject);
              bulkGroupOps.push({
                updateOne: {
                  filter: { _id: groupWithSubgroup._id },
                  update: { subGroups: groupWithSubgroup.subGroups },
                },
              });
            }

            // Add subgroup ID to user's subGroups if not already added
            if (
              !updatedSubGroups.some((subGroupId) =>
                subGroupId.equals(subgroup._id)
              )
            ) {
              updatedSubGroups.push(subgroup._id);
            }
          }
        }
      }
      console.log("o");

      // Execute bulk operations to update groups and subgroups
      if (bulkGroupOps.length > 0) {
        await Group.bulkWrite(bulkGroupOps);
      }
      console.log("p");
      // Deduplicate group and subgroup arrays before updating the user
      // updatedGroups = Array.from(
      //   new Set(updatedGroups.map((id) => id.toString()))
      // ).map((id) => new mongoose.Types.ObjectId(id));
      // updatedSubGroups = Array.from(
      //   new Set(updatedSubGroups.map((id) => id.toString()))
      // ).map((id) => new mongoose.Types.ObjectId(id));

      console.log("q");
      // Update the user's groups, subGroups, and other details
      await User.updateOne(
        { _id: userId },
        {
          $set: {
            groups: updatedGroups,
            subGroups: updatedSubGroups,
            ...rest,
            image: fileUploadResult ? fileUploadResult.secure_url : user.image,
          },
        }
      );
      console.log("r");
      user = await User.findById(userId).select("-password");
      console.log("s");
      return ResponseHandler.success(res, user, "User details");
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        `Server error: ${error.message}`,
        500
      );
    }
  }

  // async editUserProfile(req: Request, res: Response) {
  //   try {
  //     // const organizationId = req.admin._id
  //     const organizationId = await getOrganizationId(req, res);
  //     if (!organizationId) {
  //       return;
  //     }

  //     const organization = await Organization.findById(organizationId);
  //     if (!organization) {
  //       return ResponseHandler.failure(res, "Organization not found", 400);
  //     }

  //     const { userId } = req.params;
  //     const image = req.file;
  //     const { ids, ...rest } = req.body;

  //     if (!userId) {
  //       return ResponseHandler.failure(res, "User ID is required", 400);
  //     }

  //     let user = await User.findById(userId);
  //     if (!user) {
  //       return ResponseHandler.failure(res, "User not found", 404);
  //     }

  //     const parsedIds = JSON.parse(ids || "[]").filter((id: any) => id); // Remove nulls
  //     const objectIds = parsedIds.map(
  //       (id: string) => new mongoose.Types.ObjectId(id)
  //     );

  //     let updatedGroups: mongoose.Types.ObjectId[] = Array.isArray(user.groups)
  //       ? user.groups.filter((g) => g)
  //       : [];
  //     let updatedSubGroups: mongoose.Types.ObjectId[] = Array.isArray(
  //       user.subGroups
  //     )
  //       ? user.subGroups.filter((sg) => sg)
  //       : [];

  //     const bulkGroupOps: any[] = [];
  //     const userIdObject = new mongoose.Types.ObjectId(userId);

  //     for (const id of objectIds) {
  //       const group = await Group.findOne({ _id: id, organizationId });
  //       if (group) {
  //         group.members = Array.isArray(group.members)
  //           ? group.members.filter((m) => m)
  //           : [];
  //         if (
  //           !group.members.some((memberId) => memberId.equals(userIdObject))
  //         ) {
  //           group.members.push(userIdObject);
  //           bulkGroupOps.push({
  //             updateOne: {
  //               filter: { _id: group._id },
  //               update: { members: group.members },
  //             },
  //           });
  //         }
  //         if (!updatedGroups.some((groupId) => groupId.equals(group._id))) {
  //           updatedGroups.push(group._id);
  //         }
  //         continue;
  //       }

  //       const groupWithSubgroup = await Group.findOne({
  //         "subGroups._id": id,
  //         organizationId,
  //       });
  //       if (groupWithSubgroup) {
  //         const subgroup = groupWithSubgroup.subGroups.find((subGroup) =>
  //           subGroup?._id?.equals(id)
  //         );
  //         if (subgroup) {
  //           subgroup.members = Array.isArray(subgroup.members)
  //             ? subgroup.members.filter((m) => m)
  //             : [];
  //           if (
  //             !subgroup.members.some((memberId) =>
  //               memberId.equals(userIdObject)
  //             )
  //           ) {
  //             subgroup.members.push(userIdObject);
  //             bulkGroupOps.push({
  //               updateOne: {
  //                 filter: { _id: groupWithSubgroup._id },
  //                 update: { subGroups: groupWithSubgroup.subGroups },
  //               },
  //             });
  //           }
  //           if (
  //             !updatedSubGroups.some((subGroupId) =>
  //               subGroupId.equals(subgroup._id)
  //             )
  //           ) {
  //             updatedSubGroups.push(subgroup._id);
  //           }
  //         }
  //       }
  //     }

  //     if (bulkGroupOps.length > 0) {
  //       await Group.bulkWrite(bulkGroupOps);
  //     }

  //     let fileUploadResult: any = null;
  //     if (image) {
  //       fileUploadResult = await uploadToCloudinary(
  //         image.buffer,
  //         image.mimetype,
  //         "userDisplayPictures"
  //       );
  //     }

  //     console.log("Updated Groups:", updatedGroups);
  //     console.log("Updated SubGroups:", updatedSubGroups);

  //     // await User.updateOne(
  //     //   { _id: userId },
  //     //   {
  //     //     groups: updatedGroups,
  //     //     subGroups: updatedSubGroups
  //     //   }
  //     // );

  //     // await User.updateOne(
  //     //   { _id: userId },
  //     //   {
  //     //     $set: {
  //     //       groups: updatedGroups,
  //     //       subGroups: updatedSubGroups,
  //     //       ...rest,
  //     //       image: fileUploadResult ? fileUploadResult.secure_url : user.image,
  //     //     },
  //     //   }
  //     // );

  //     // user = await User.findById(userId).select("-password");

  //     user = await User.findByIdAndUpdate(
  //       userId,
  //       {
  //         $set: {
  //           groups: updatedGroups,
  //           subGroups: updatedSubGroups,
  //           ...rest,
  //           image: fileUploadResult ? fileUploadResult.secure_url : user.image,
  //         },
  //       },
  //       { new: true } // This ensures you get the updated user
  //     ).select("-password");

  //     user = await User.findById(userId).select("groups subGroups");
  //     console.log("Updated User Groups:", user?.groups);
  //     console.log("Updated User SubGroups:", user?.subGroups);

  //     return ResponseHandler.success(
  //       res,
  //       user,
  //       "User groups updated successfully"
  //     );
  //   } catch (error: any) {
  //     return ResponseHandler.failure(
  //       res,
  //       `Server error: ${error.message}`,
  //       500
  //     );
  //   }
  // }

  async editUserProfile(req: Request, res: Response) {
    try {
      const organizationId = await getOrganizationId(req, res);
      if (!organizationId) {
        return;
      }

      const organization = await Organization.findById(organizationId);
      if (!organization) {
        return ResponseHandler.failure(res, "Organization not found", 400);
      }

      const { userId } = req.params;
      const image = req.file;
      const { ids, password, ...rest } = req.body;  // Explicitly destructure and exclude password

      if (!userId) {
        return ResponseHandler.failure(res, "User ID is required", 400);
      }

      let user = await User.findById(userId);
      if (!user) {
        return ResponseHandler.failure(res, "User not found", 404);
      }

      // Parse `ids` safely
      let parsedIds: string[] = [];
      try {
        parsedIds = Array.isArray(ids) ? ids : JSON.parse(ids || "[]");
      } catch (error) {
        return ResponseHandler.failure(res, "Invalid `ids` format", 400);
      }

      const updatedGroups: mongoose.Types.ObjectId[] = [];
      const updatedSubGroups: mongoose.Types.ObjectId[] = [];
      const bulkGroupOps: any[] = [];
      const userIdObject = new mongoose.Types.ObjectId(userId);

      for (const id of parsedIds) {
        const objectId = new mongoose.Types.ObjectId(id);

        // Check if ID belongs to a group
        const group = await Group.findOne({ _id: objectId, organizationId });
        if (group) {
          if (
            !group.members.some((memberId) => memberId.equals(userIdObject))
          ) {
            group.members.push(userIdObject);
            bulkGroupOps.push({
              updateOne: {
                filter: { _id: group._id },
                update: { $addToSet: { members: userIdObject } },
              },
            });
          }
          updatedGroups.push(group._id);
          continue;
        }

        // Check if ID belongs to a subgroup
        const groupWithSubgroup = await Group.findOne({
          "subGroups._id": objectId,
          organizationId,
        });

        if (groupWithSubgroup) {
          const subgroup = groupWithSubgroup.subGroups.find((sub) =>
            sub._id.equals(objectId)
          );

          if (subgroup) {
            if (
              !subgroup.members.some((memberId) =>
                memberId.equals(userIdObject)
              )
            ) {
              subgroup.members.push(userIdObject);
              bulkGroupOps.push({
                updateOne: {
                  filter: {
                    _id: groupWithSubgroup._id,
                    "subGroups._id": objectId,
                  },
                  update: {
                    $addToSet: { "subGroups.$.members": userIdObject },
                  },
                },
              });
            }
            updatedSubGroups.push(subgroup._id);
          }
        }
      }

      // Perform bulk updates if needed
      if (bulkGroupOps.length > 0) {
        await Group.bulkWrite(bulkGroupOps);
      }

      // Handle image upload if provided
      let fileUploadResult: any = null;
      if (image) {
        fileUploadResult = await uploadToCloudinary(
          image.buffer,
          image.mimetype,
          "userDisplayPictures"
        );
      }

      // Update user with correct groups and subgroups
      user = await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            groups: updatedGroups.length ? updatedGroups : user.groups,
            subGroups: updatedSubGroups.length
              ? updatedSubGroups
              : user.subGroups,
            ...rest,  // rest object now explicitly excludes password
            image: fileUploadResult ? fileUploadResult.secure_url : user.image,
          },
        },
        { new: true }
      ).select("-password");

      console.log("Updated User Groups:", user?.groups);
      console.log("Updated User SubGroups:", user?.subGroups);

      return ResponseHandler.success(
        res,
        user,
        "User profile updated successfully"
      );
    } catch (error: any) {
      console.error("Error updating user profile:", error);
      return ResponseHandler.failure(
        res,
        `Server error: ${error.message}`,
        500
      );
    }
  }

  async viewAUserProfile(req: Request, res: Response) {
    try {
      // const organizationId = req.admin._id;
      let organizationId = await getOrganizationId(req, res);
      if (!organizationId) {
        return;
      }

      const organization = await Organization.findById(organizationId);
      if (!organization) {
        return ResponseHandler.failure(res, "Organization not found", 400);
      }

      const userId = req.params.userId;

      const user = await User.findOne({ _id: userId, organizationId }).select(
        "-password"
      );

      if (!user) {
        return ResponseHandler.failure(
          res,
          "User not found in your organization",
          404
        );
      }

      const paymentHistory = await Payment.find({ userId: user._id });

      const assignedBills = await AssignedBill.find({
        organizationId,
        "assignee.individuals": user._id,
      });

      const userWithDetails = {
        ...user.toObject(),
        paymentHistory,
        assignedBills,
      };

      return ResponseHandler.success(
        res,
        userWithDetails,
        "User profile fetched successfully"
      );
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        `Server error: ${error.message}`,
        500
      );
    }
  }

  async generateCourseReport(req: Request, res: Response) {
    try {
      const { courseId } = req.params;

      const course = await Course.findById(courseId)
        .populate("assignedLearnersIds.userId")
        .populate("assessments");
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      const assignedUsers =
        course.assignedLearnerIds?.map((learner: any) => learner.userId) || [];

      console.log("assignedUsers", assignedUsers);

      const totalUsers = assignedUsers.length;

      const submissions = await Submission.aggregate([
        { $match: { courseId: new mongoose.Types.ObjectId(courseId) } },
        { $sort: { createdAt: -1 } },
        {
          $group: {
            _id: "$learnerId",
            latestSubmission: { $first: "$$ROOT" },
          },
        },
        {
          $replaceRoot: { newRoot: "$latestSubmission" },
        },
        {
          $lookup: {
            from: "users",
            localField: "learnerId",
            foreignField: "_id",
            as: "learnerDetails",
          },
        },
        {
          $unwind: {
            path: "$learnerDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "assessments",
            localField: "assessmentId",
            foreignField: "_id",
            as: "assessmentDetails",
          },
        },
        {
          $unwind: {
            path: "$assessmentDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
      ]);

      const learnerReport = [];
      let completedCount = 0;
      let passCount = 0;
      let failCount = 0;

      for (const user of assignedUsers) {
        const userDetails = await User.findById(user._id);
        if (!userDetails) {
          return ResponseHandler.failure(res, "User not found", 400);
        }

        const submission = submissions.find(
          (sub) => sub.learnerId._id.toString() === user._id.toString()
        );

        if (submission) {
          learnerReport.push({
            userId: userDetails.userId,
            firstName: userDetails.firstName,
            lastName: userDetails.lastName,
            score: submission.score || null,
            maxObtainableMarks: submission.maxObtainableMarks || null,
            percentageScore: submission.percentageScore || null,
            passOrFail: submission.passOrFail || null,
          });

          completedCount++;
          if (submission.passOrFail === "Pass") passCount++;
          if (submission.passOrFail === "Fail") failCount++;
        } else {
          learnerReport.push({
            userId: userDetails.userId,
            firstName: userDetails.firstName,
            lastName: userDetails.lastName,
            score: null,
            maxObtainableMarks: null,
            percentageScore: null,
            passOrFail: null,
          });
        }
      }

      const percentageCompleted = ((completedCount / totalUsers) * 100).toFixed(
        2
      );
      const percentageIncomplete = (
        100 - parseFloat(percentageCompleted)
      ).toFixed(2);

      const successPercentage =
        completedCount > 0
          ? ((passCount / completedCount) * 100).toFixed(2)
          : "0";
      const failurePercentage =
        completedCount > 0
          ? ((failCount / completedCount) * 100).toFixed(2)
          : "0";

      return res.status(200).json({
        totalUsers,
        completion: {
          percentageCompleted,
          percentageIncomplete,
        },
        successRate: {
          successPercentage,
          failurePercentage,
        },
        learnerReport,
      });
    } catch (error) {
      console.error("Error generating course report:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  async updateAnOrganization(req: Request, res: Response) {
    try {
      // const organizationId = req.admin._id;
      let organizationId = await getOrganizationId(req, res);
      if (!organizationId) {
        return;
      }

      const organization = await Organization.findById(organizationId);
      if (!organization) {
        return ResponseHandler.failure(res, "Organization not found", 404);
      }

      const { name, organisationLogo } = req.body;

      const files = req.files as Express.Multer.File[];

      if (!organization) {
        return ResponseHandler.failure(res, "Organization does not exist", 404);
      }

      let Urls: string[] = [];

      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const uploadResult = await uploadToCloudinary(
            file.buffer,
            file.mimetype,
            "course-content"
          );
          if (uploadResult && uploadResult.secure_url) {
            Urls.push(uploadResult.secure_url);
          }
        }
      }

      const updatedOrganization = await Organization.findByIdAndUpdate(
        organizationId,
        { $set: { name, organisationLogo: organisationLogo || Urls[0] } },
        { new: true, runValidators: true }
      ).select("-password");

      return ResponseHandler.success(
        res,
        updatedOrganization,
        "Organization details updated successfully"
      );
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        `Server error: ${error.message}`,
        500
      );
    }
  }

  async updateGeneralLearnerTerm(req: Request, res: Response) {
    try {
      const organizationId = req.admin._id;

      const { generalLearnerTerm } = req.body;

      const updateGeneralLearnerTerm = await Organization.updateOne(
        { _id: organizationId },
        {
          $set: {
            generalLearnerTerm,
          },
        }
      );

      if (!updateGeneralLearnerTerm) {
        return ResponseHandler.failure(res, "Organization not found", 404);
      }

      return ResponseHandler.success(
        res,
        "General Learner Term updated successfully."
      );
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        error.message || "Failed to update general learner term"
      );
    }
  }

  async updateGeneralLearnerGroupTerm(req: Request, res: Response) {
    try {
      const organizationId = req.admin._id;

      const { generalLearnerGroupTerm } = req.body;

      const updateGeneralLearnerGroupTerm = await Organization.updateOne(
        { _id: organizationId },
        {
          $set: {
            generalLearnerGroupTerm,
          },
        }
      );

      if (!updateGeneralLearnerGroupTerm) {
        return ResponseHandler.failure(res, "Organization not found", 404);
      }

      return ResponseHandler.success(
        res,
        "General Learner Group Term updated successfully."
      );
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        error.message || "Failed to update general learner group term"
      );
    }
  }

  async updateGeneralSubLearnerGroupTerm(req: Request, res: Response) {
    try {
      const organizationId = req.admin._id;

      const { generalSubLearnerGroupTerm } = req.body;

      const updateGeneralSubLearnerGroupTerm = await Organization.updateOne(
        { _id: organizationId },
        {
          $set: {
            generalSubLearnerGroupTerm,
          },
        }
      );

      if (!updateGeneralSubLearnerGroupTerm) {
        return ResponseHandler.failure(res, "Organization not found", 404);
      }

      return ResponseHandler.success(
        res,
        "General Sub-Learner Group Term updated successfully."
      );
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        error.message || "Failed to update general sub-learner group term"
      );
    }
  }

  async updateGeneralInstructorTerm(req: Request, res: Response) {
    try {
      const organizationId = req.admin._id;

      const { generalInstructorTerm } = req.body;

      const updateGeneralInstructorTerm = await Organization.updateOne(
        { _id: organizationId },
        {
          $set: {
            generalInstructorTerm,
          },
        }
      );

      if (!updateGeneralInstructorTerm) {
        return ResponseHandler.failure(res, "Organization not found", 404);
      }

      return ResponseHandler.success(
        res,
        "General Instructor Term updated successfully."
      );
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        error.message || "Failed to update general instructor term"
      );
    }
  }

  async verifyOrganization(adminOrganizationId: string, userId: string) {
    try {
      console.log("Verifying organization...");
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }
      if (String(user.organizationId) !== adminOrganizationId) {
        throw new Error(
          "Unauthorized: User does not belong to your organization"
        );
      }
      return user;
    } catch (error: any) {
      console.error("Error in verifyOrganization:", error.message);
      throw error;
    }
  }

  async archiveUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      let organizationId = await getOrganizationId(req, res);
      if (!organizationId) {
        return;
      }

      const organization = await Organization.findById(organizationId);
      if (!organization) {
        return ResponseHandler.failure(res, "Organization not found", 400);
      }

      await new AdminController().verifyOrganization(
        String(organizationId),
        userId
      );

      const user = await User.findByIdAndUpdate(
        userId,
        { isArchived: true },
        { new: true }
      ).select(" -password ");

      if (!user) {
        return ResponseHandler.failure(res, "User not found", 404);
      }

      return ResponseHandler.success(res, user, "User archived successfully");
    } catch (error) {}
  }

  async enableUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      let organizationId = await getOrganizationId(req, res);
      if (!organizationId) {
        return;
      }

      const organization = await Organization.findById(organizationId);
      if (!organization) {
        return ResponseHandler.failure(res, "Organization not found", 400);
      }

      await new AdminController().verifyOrganization(
        String(organizationId),
        userId
      );

      const user = await User.findByIdAndUpdate(
        userId,
        { isEnabled: true, isDisabled: false },
        { new: true }
      );

      if (!user) {
        return ResponseHandler.failure(res, "User not found", 404);
      }

      return ResponseHandler.success(res, user, "User enabled successfully");
    } catch (error: any) {}
  }

  async disableUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      let organizationId = await getOrganizationId(req, res);
      if (!organizationId) {
        return;
      }

      const organization = await Organization.findById(organizationId);
      if (!organization) {
        return ResponseHandler.failure(res, "Organization not found", 400);
      }

      await new AdminController().verifyOrganization(
        String(organizationId),
        userId
      );

      const user = await User.findByIdAndUpdate(
        userId,
        { isEnabled: false, isDisabled: true },
        { new: true }
      );

      if (!user) {
        return ResponseHandler.failure(res, "User not found", 404);
      }

      return ResponseHandler.success(res, user, "User disabled successfully");
    } catch (error) {}
  }

  async archiveCourse(req: Request, res: Response) {
    try {
      const { courseId } = req.params;

      let adminId = await getOrganizationId(req, res);
      if (!adminId) {
        return;
      }

      const organization = await Organization.findById(adminId);
      if (!organization) {
        return ResponseHandler.failure(res, "Organization not found", 400);
      }

      // const adminId = req.user._id; // Assume the admin's ID is extracted from a middleware

      // Validate admin privileges (if applicable)
      const admin = await Organization.findById(adminId);
      if (!admin || admin.role !== "admin") {
        return ResponseHandler.failure(res, "Unauthorized access", 403);
      }

      // Find the course
      const course = await Course.findById(courseId);
      if (!course) {
        return ResponseHandler.failure(res, "Course not found", 404);
      }

      // Archive the course
      course.isArchived = true;
      await course.save();

      return ResponseHandler.success(res, null, "Course archived successfully");
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        `Error archiving course: ${error.message}`,
        500
      );
    }
  }

  async changeUserPassword(req: Request, res: Response) {

     try {
      // const { userId } = req.params;
      const { email, newPassword } = req.body;
      const organizationId = req.admin._id

      const user = await User.findOne({
        email,
        organizationId
      })
      console.log(user?.password, "previous password")
      if (!user) return ResponseHandler.failure(res, "User not found in your organization", 404);

      const newHashedPassword = await hashPassword(newPassword);
  
      user.password = newHashedPassword;
      user.save()

      const userResponse = await User.findById(user._id).select(
        "-password -role"
      );
      return ResponseHandler.success(
        res,
        userResponse,
        "User password updated successfully",
        200
      );
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "An error occurred while changing user password",
        error: error.message,
      });
    }
  }
}

export default new AdminController();
