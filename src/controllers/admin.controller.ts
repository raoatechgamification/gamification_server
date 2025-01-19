import { Request, Response } from "express";
import mongoose, { isValidObjectId } from "mongoose"; // Ensure this is imported if not already
import { ResponseHandler } from "../middlewares/responseHandler.middleware";
import AssignedBill from "../models/assignedBill.model";
import Course from "../models/course.model";
import Organization from "../models/organization.model";
import Payment from "../models/payment.model";
import Submission from "../models/submission.model";
import User from "../models/user.model";
import { uploadToCloudinary } from "../utils/cloudinaryUpload";
import { getOrganizationId } from "../utils/getOrganizationId.util"

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
      let fileUploadResult: any = null;
      if (image) {
        fileUploadResult = await uploadToCloudinary(
          image.buffer,
          image.mimetype,
          "userDisplayPictures"
        );
      }
      if (!user) {
        return ResponseHandler.failure(
          res,
          "User not found in your organization",
          404
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

  // async generateCourseReport(req: Request, res: Response) {
  //   try {
  //     const { courseId } = req.params;  // Get courseId from the URL parameters

  //     // Fetch the course by ID and populate the assigned learners and assessments
  //     const course = await Course.findById(courseId)
  //       .populate('assignedLearnersIds.userId')
  //       .populate('assessments');
  //     if (!course) {
  //       return res.status(404).json({ message: 'Course not found' });
  //     }

  //     // Get all users assigned to the course
  //     const assignedUsers = course.assignedLearnersIds?.map((learner: any) => learner.userId) || [];

  //     console.log("assignedUsers", assignedUsers)

  //     const totalUsers = assignedUsers.length;

  //     // Fetch submissions for the course
  //     const submissions = await Submission.find({ courseId }).populate('learnerId').populate('assessmentId');

  //     const learnerReport = [];
  //     let completedCount = 0;
  //     let passCount = 0;
  //     let failCount = 0;

  //     // Loop through each user assigned to the course
  //     for (const user of assignedUsers) {
  //       const userDetails = await User.findById(user._id)
  //       if (!userDetails) {
  //         return ResponseHandler.failure(
  //           res,
  //           "User not found",
  //           400
  //         );
  //       }
  //       const submission = submissions.find(sub => sub.learnerId._id.toString() === user._id.toString());

  //       if (submission) {
  //         // If the user has taken the assessment, include their details

  //         learnerReport.push({
  //           userId: userDetails.userId,
  //           firstName: userDetails.firstName,
  //           lastName: userDetails.lastName,
  //           score: submission.score || null,
  //           maxObtainableMarks: submission.maxObtainableMarks || null,
  //           percentageScore: submission.percentageScore || null,
  //           passOrFail: submission.passOrFail || null
  //         });

  //         // Update counts for completed, pass, and fail
  //         completedCount++;
  //         if (submission.passOrFail === 'Pass') passCount++;
  //         if (submission.passOrFail === 'Fail') failCount++;
  //       } else {
  //         // If the user hasn't taken the assessment, set null values
  //         learnerReport.push({
  //           userId: userDetails.userId,
  //           firstName: userDetails.firstName,
  //           lastName: userDetails.lastName,
  //           score: null,
  //           maxObtainableMarks: null,
  //           percentageScore: null,
  //           passOrFail: null
  //         });
  //       }
  //     }

  //     // Calculate completion percentages
  //     const percentageCompleted = ((completedCount / totalUsers) * 100).toFixed(2);
  //     const percentageIncomplete = (100 - parseFloat(percentageCompleted)).toFixed(2);

  //     // Calculate success and failure percentages excluding users who haven't taken the course
  //     const successPercentage = completedCount > 0 ? ((passCount / completedCount) * 100).toFixed(2) : '0';
  //     const failurePercentage = completedCount > 0 ? ((failCount / completedCount) * 100).toFixed(2) : '0';

  //     // Return the course report
  //     return res.status(200).json({
  //       totalUsers,
  //       completion: {
  //         percentageCompleted,
  //         percentageIncomplete
  //       },
  //       successRate: {
  //         successPercentage,
  //         failurePercentage
  //       },
  //       learnerReport
  //     });

  //   } catch (error) {
  //     console.error('Error generating course report:', error);
  //     return res.status(500).json({ message: 'Server error' });
  //   }
  // }

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
      const organizationId = req.admin._id

      const { generalLearnerTerm } = req.body

      const updateGeneralLearnerTerm = await Organization.updateOne(
        { _id: organizationId },
        {
          $set: {
            generalLearnerTerm
          }
        }
      )

      if (!updateGeneralLearnerTerm) {
        return ResponseHandler.failure(res, "Organization not found", 404)
      }

      return ResponseHandler.success(
        res,
        "General Learner Term updated successfully."
      )
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        error.message || "Failed to update general learner term"
      );
    }
  }

  async updateGeneralLearnerGroupTerm(req: Request, res: Response) {
    try {
      const organizationId = req.admin._id

      const { generalLearnerGroupTerm } = req.body

      const updateGeneralLearnerGroupTerm = await Organization.updateOne(
        { _id: organizationId },
        {
          $set: {
            generalLearnerGroupTerm
          }
        }
      )

      if (!updateGeneralLearnerGroupTerm) {
        return ResponseHandler.failure(res, "Organization not found", 404)
      }

      return ResponseHandler.success(
        res,
        "General Learner Group Term updated successfully."
      )
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        error.message || "Failed to update general learner group term"
      );
    }
  }

  async updateGeneralSubLearnerGroupTerm(req: Request, res: Response) {
    try {
      const organizationId = req.admin._id

      const { generalSubLearnerGroupTerm } = req.body

      const updateGeneralSubLearnerGroupTerm = await Organization.updateOne(
        { _id: organizationId },
        {
          $set: {
            generalSubLearnerGroupTerm
          }
        }
      )

      if (!updateGeneralSubLearnerGroupTerm) {
        return ResponseHandler.failure(res, "Organization not found", 404)
      }

      return ResponseHandler.success(
        res,
        "General Sub-Learner Group Term updated successfully."
      )
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        error.message || "Failed to update general sub-learner group term"
      );
    }
  }

  async updateGeneralInstructorTerm(req: Request, res: Response) {
    try {
      const organizationId = req.admin._id

      const { generalInstructorTerm } = req.body

      const updateGeneralInstructorTerm = await Organization.updateOne(
        { _id: organizationId },
        {
          $set: {
            generalInstructorTerm
          }
        }
      )

      if (!updateGeneralInstructorTerm) {
        return ResponseHandler.failure(res, "Organization not found", 404)
      }

      return ResponseHandler.success(
        res,
        "General Instructor Term updated successfully."
      )
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        error.message || "Failed to update general instructor term"
      );
    }
  }
}

export default new AdminController();
