import { Request, Response } from "express";
import { ResponseHandler } from "../middlewares/responseHandler.middleware";
import Payment from "../models/payment.model";
import AssignedBill from "../models/assignedBill.model";
import User, { IUser } from "../models/user.model";
import Course from "../models/course.model";
import Submission, { PopulatedLearner, PopulatedAssessment } from "../models/submission.model";
import { parse as json2csv } from 'json2csv';
import * as XLSX from "xlsx";
import mongoose, { isValidObjectId } from "mongoose"; // Ensure this is imported if not already

function isPopulated<T>(value: mongoose.Types.ObjectId | T): value is T {
  return typeof value === "object" && value !== null && !isValidObjectId(value);
} 

class AdminController {
  async viewAllUsers(req: Request, res: Response) {
    try {
      const organizationId = req.admin._id;

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
      const organizationId = req.admin._id;
      const userId = req.params.userId;
      const { username, firstName, lastName, batch, role, yearsOfExperience, highestEducationLevel, gender, dateOfBirth } = req.body;

      const user = await User.findOne({ _id: userId, organizationId });

      if (!user) {
        return ResponseHandler.failure(
          res,
          "User not found in your organization",
          404
        );
      }

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: { username, firstName, lastName, batch, userType: role, yearsOfExperience, highestEducationLevel, gender, dateOfBirth} },
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
      console.log("The request went through")
      const organizationId = req.admin._id;
      console.log(organizationId)
      const userId = req.params.userId;
      console.log(userId)

      const user = await User.findOne({ _id: userId, organizationId }).select("-password");

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
        .populate('assignedLearnersIds.userId')
        .populate('assessments');
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
  
      const assignedUsers = course.assignedLearnersIds?.map((learner: any) => learner.userId) || [];
  
      console.log("assignedUsers", assignedUsers);
  
      const totalUsers = assignedUsers.length;
  
      const submissions = await Submission.aggregate([
        { $match: { courseId: new mongoose.Types.ObjectId(courseId) } }, 
        { $sort: { createdAt: -1 } }, 
        {
          $group: {
            _id: '$learnerId', 
            latestSubmission: { $first: '$$ROOT' }, 
          }
        },
        {
          $replaceRoot: { newRoot: '$latestSubmission' } 
        },
        {
          $lookup: {
            from: 'users',
            localField: 'learnerId',
            foreignField: '_id',
            as: 'learnerDetails',
          }
        },
        {
          $unwind: { path: '$learnerDetails', preserveNullAndEmptyArrays: true } 
        },
        {
          $lookup: {
            from: 'assessments', 
            localField: 'assessmentId',
            foreignField: '_id',
            as: 'assessmentDetails',
          }
        },
        {
          $unwind: { path: '$assessmentDetails', preserveNullAndEmptyArrays: true } 
        }
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
  
        const submission = submissions.find(sub => sub.learnerId._id.toString() === user._id.toString());
  
        if (submission) {
          learnerReport.push({
            userId: userDetails.userId,
            firstName: userDetails.firstName,
            lastName: userDetails.lastName,
            score: submission.score || null,
            maxObtainableMarks: submission.maxObtainableMarks || null,
            percentageScore: submission.percentageScore || null,
            passOrFail: submission.passOrFail || null
          });
  
          completedCount++;
          if (submission.passOrFail === 'Pass') passCount++;
          if (submission.passOrFail === 'Fail') failCount++;
        } else {
          learnerReport.push({
            userId: userDetails.userId,
            firstName: userDetails.firstName,
            lastName: userDetails.lastName,
            score: null,
            maxObtainableMarks: null,
            percentageScore: null,
            passOrFail: null
          });
        }
      }
  
      const percentageCompleted = ((completedCount / totalUsers) * 100).toFixed(2);
      const percentageIncomplete = (100 - parseFloat(percentageCompleted)).toFixed(2);
  
      const successPercentage = completedCount > 0 ? ((passCount / completedCount) * 100).toFixed(2) : '0';
      const failurePercentage = completedCount > 0 ? ((failCount / completedCount) * 100).toFixed(2) : '0';
  
      return res.status(200).json({
        totalUsers,
        completion: {
          percentageCompleted,
          percentageIncomplete
        },
        successRate: {
          successPercentage,
          failurePercentage
        },
        learnerReport
      });
  
    } catch (error) {
      console.error('Error generating course report:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }
}

export default new AdminController();
