import { Request, Response } from "express";
import mongoose, { isValidObjectId } from "mongoose"; // Ensure this is imported if not already
import { ResponseHandler } from "../middlewares/responseHandler.middleware";
import AssignedBill from "../models/assignedBill.model";
import Course from "../models/course.model";
import Organization from "../models/organization.model";
import Payment from "../models/payment.model";
import Submission from "../models/submission.model";
import User from "../models/user.model";
import Group from "../models/group.model";
import { uploadToCloudinary } from "../utils/cloudinaryUpload";
import { getOrganizationId } from "../utils/getOrganizationId.util";

function isPopulated<T>(value: mongoose.Types.ObjectId | T): value is T {
  return typeof value === "object" && value !== null && !isValidObjectId(value);
}

class AdminController {
  async viewAllUsers(req: Request, res: Response) {
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

      const users = await User.find({ organizationId });

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

      const image = req.file; // Uploaded image
      const userId = req.params.userId;

      // Parse `ids` from the form-data
      const { ids = "[]", ...rest } = req.body; // Default to empty array if not provided
      let parsedIds: string[] = [];

      try {
        parsedIds = JSON.parse(ids); // Parse `ids` into an array
      } catch (error) {
        return ResponseHandler.failure(res, "Invalid 'ids' format", 400);
      }

      // Ensure all IDs are converted to ObjectId
      const objectIds = parsedIds.map(
        (id: string) => new mongoose.Types.ObjectId(id)
      );

      // Fetch the user and ensure they belong to the organization
      let user = await User.findOne({ _id: userId, organizationId });
      if (!user) {
        return ResponseHandler.failure(
          res,
          "User not found in your organization",
          404
        );
      }

      let fileUploadResult: any = null;
      if (image) {
        fileUploadResult = await uploadToCloudinary(
          image.buffer,
          image.mimetype,
          "userDisplayPictures"
        );
      }

      // Initialize variables for updates
      let updatedGroups: mongoose.Types.ObjectId[] = user.groups || [];
      let updatedSubGroups: mongoose.Types.ObjectId[] = user.subGroups || [];
      const bulkGroupOps: any[] = [];

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

        // Check if the ID belongs to a subgroup
        const groupWithSubgroup = await Group.findOne({
          "subGroups._id": id,
          organizationId,
        });

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

      // Execute bulk operations to update groups and subgroups
      if (bulkGroupOps.length > 0) {
        await Group.bulkWrite(bulkGroupOps);
      }

      // Deduplicate group and subgroup arrays before updating the user
      updatedGroups = Array.from(
        new Set(updatedGroups.map((id) => id.toString()))
      ).map((id) => new mongoose.Types.ObjectId(id));
      updatedSubGroups = Array.from(
        new Set(updatedSubGroups.map((id) => id.toString()))
      ).map((id) => new mongoose.Types.ObjectId(id));

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

      user = await User.findById(userId).select("-password");

      return ResponseHandler.success(res, user, "User details");
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
      // const organizationId = req.admin._id;
      let organizationId = await getOrganizationId(req, res);
      if (!organizationId) {
        return;
      }

      const organization = await Organization.findById(organizationId);
      if (!organization) {
        return ResponseHandler.failure(res, "Organization not found", 400);
      }

      const image = req.file;

      const userId = req.params.userId;
      const {
        firstName,
        lastName,
        otherName,
        email,
        phone,
        username,
        groupId,
        gender,
        dateOfBirth,
        country,
        address,
        city,
        LGA,
        state,
        officeAddress,
        officeCity,
        officeLGA,
        officeState,
        employerName,
        role,
        batch,
        image: cloudinaryImage,
        // password,
        sendEmail,
        yearsOfExperience,
        highestEducationLevel,
        contactPersonPlaceOfEmployment,
        nameOfContactPerson,
        contactEmail,
        contactPersonPhoneNumber,
        userId: userIdCode,
      } = req.body;

      const user = await User.findOne({ _id: userId, organizationId });
      if (!user) {
        return ResponseHandler.failure(
          res,
          "User not found in your organization",
          404
        );
      }

      let fileUploadResult: any = null;
      if (image) {
        fileUploadResult = await uploadToCloudinary(
          image.buffer,
          image.mimetype,
          "userDisplayPictures"
        );
      }

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            userId: userIdCode,
            username,
            firstName,
            lastName,
            batch,
            userType: role,
            yearsOfExperience,
            highestEducationLevel,
            gender,
            dateOfBirth,
            otherName,
            email,
            phone,
            country,
            address,
            city,
            LGA,
            image: fileUploadResult
              ? fileUploadResult.secure_url
              : cloudinaryImage,
            state,
            officeAddress,
            officeCity,
            officeLGA,
            officeState,
            employerName,
            // password,
            sendEmail,
            contactPersonPlaceOfEmployment,
            nameOfContactPerson,
            contactEmail,
            contactPersonPhoneNumber,
          },
        },
        { new: true, runValidators: true }
      );

      return ResponseHandler.success(
        res,
        updatedUser,
        "User details updated successfully"
      );
    } catch (error: any) {
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
}

export default new AdminController();
