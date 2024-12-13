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
      const { courseId } = req.params;  // Get courseId from the URL parameters
  
      // Fetch the course by ID and populate the assigned learners and assessments
      const course = await Course.findById(courseId)
        .populate('assignedLearnersIds.userId')
        .populate('assessments');
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
  
      // Get all users assigned to the course
      const assignedUsers = course.assignedLearnersIds?.map((learner: any) => learner.userId) || [];
  
      console.log("assignedUsers", assignedUsers);
  
      const totalUsers = assignedUsers.length;
  
      // Fetch the latest submissions for each learner using aggregation
      const submissions = await Submission.aggregate([
        { $match: { courseId: new mongoose.Types.ObjectId(courseId) } }, // Match courseId
        { $sort: { createdAt: -1 } }, // Sort by latest submission
        {
          $group: {
            _id: '$learnerId', // Group by learnerId
            latestSubmission: { $first: '$$ROOT' }, // Take the first document (latest)
          }
        },
        {
          $replaceRoot: { newRoot: '$latestSubmission' } // Replace with the latest submission document
        },
        // Lookup to populate learnerId
        {
          $lookup: {
            from: 'users', // The collection name for users
            localField: 'learnerId',
            foreignField: '_id',
            as: 'learnerDetails',
          }
        },
        {
          $unwind: { path: '$learnerDetails', preserveNullAndEmptyArrays: true } // Unwind learnerDetails to get a single document
        },
        // Lookup to populate assessmentId
        {
          $lookup: {
            from: 'assessments', // The collection name for assessments
            localField: 'assessmentId',
            foreignField: '_id',
            as: 'assessmentDetails',
          }
        },
        {
          $unwind: { path: '$assessmentDetails', preserveNullAndEmptyArrays: true } // Unwind assessmentDetails
        }
      ]);
  
      const learnerReport = [];
      let completedCount = 0;
      let passCount = 0;
      let failCount = 0;
  
      // Loop through each user assigned to the course
      for (const user of assignedUsers) {
        const userDetails = await User.findById(user._id);
        if (!userDetails) {
          return ResponseHandler.failure(res, "User not found", 400);
        }
  
        const submission = submissions.find(sub => sub.learnerId._id.toString() === user._id.toString());
  
        if (submission) {
          // If the user has taken the assessment, include their details
          learnerReport.push({
            userId: userDetails.userId,
            firstName: userDetails.firstName,
            lastName: userDetails.lastName,
            score: submission.score || null,
            maxObtainableMarks: submission.maxObtainableMarks || null,
            percentageScore: submission.percentageScore || null,
            passOrFail: submission.passOrFail || null
          });
  
          // Update counts for completed, pass, and fail
          completedCount++;
          if (submission.passOrFail === 'Pass') passCount++;
          if (submission.passOrFail === 'Fail') failCount++;
        } else {
          // If the user hasn't taken the assessment, set null values
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
  
      // Calculate completion percentages
      const percentageCompleted = ((completedCount / totalUsers) * 100).toFixed(2);
      const percentageIncomplete = (100 - parseFloat(percentageCompleted)).toFixed(2);
  
      // Calculate success and failure percentages excluding users who haven't taken the course
      const successPercentage = completedCount > 0 ? ((passCount / completedCount) * 100).toFixed(2) : '0';
      const failurePercentage = completedCount > 0 ? ((failCount / completedCount) * 100).toFixed(2) : '0';
  
      // Return the course report
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
  
  


  // async getCourseReport(req: Request, res: Response) {
  //   try {
  //     const { courseId } = req.params;
  //     const { format } = req.query;
  
  //     const course = await Course.findById(courseId).populate<{
  //       learnerIds: { userId: string; progress: number }[];
  //       assignedLearnersIds: { userId: string }[];
  //     }>(['learnerIds', 'assignedLearnersIds']);
  
  //     if (!course) {
  //       return res.status(404).json({ message: 'Course not found' });
  //     }
  
  //     const submissions = await Submission.find({ courseId }).populate<{
  //       learnerId: IUser;
  //       assessmentId: PopulatedAssessment;
  //     }>('learnerId assessmentId');
  
  //     // Create a map of submissions for quick lookup
  //     const submissionMap = new Map<string, any>();
  //     // submissions.forEach((submission) => {
  //     //   const learnerId = submission.learnerId._id.toString();
  //     //   submissionMap.set(learnerId, submission);
  //     // });

  //     submissions.forEach((submission) => {
  //       const { learnerId } = submission;
      
  //       if (typeof learnerId === 'object' && '_id' in learnerId) {
  //         const learnerIdStr = (learnerId as PopulatedLearner)._id.toString();
  //         submissionMap.set(learnerIdStr, submission);
  //       }
  //     });
  
  //     let completedCount = 0;
  //     let incompleteCount = 0;
  //     let successCount = 0;
  //     let failureCount = 0;
  
  //     const learnerReports = course.assignedLearnersIds.map(({ userId }) => {
  //       const submission = submissionMap.get(userId.toString());
  
  //       if (submission) {
  //         const { learnerId, score = 0, maxObtainableMarks = 0, passOrFail } = submission;
  
  //         const percentageScore = maxObtainableMarks > 0
  //           ? Math.round((score / maxObtainableMarks) * 100)
  //           : 0;
  
  //         completedCount += 1;
  //         if (passOrFail === 'Pass') {
  //           successCount += 1;
  //         } else {
  //           failureCount += 1;
  //         }
  
  //         return {
  //           userId: learnerId.userId,
  //           firstName: learnerId.firstName,
  //           lastName: learnerId.lastName,
  //           score,
  //           maxObtainableMarks,
  //           percentageScore,
  //           passOrFail,
  //         };
  //       } else {
  //         incompleteCount += 1;
  
  //         // Return a default entry for learners without submissions
  //         return {
  //           userId,
  //           firstName: null,
  //           lastName: null,
  //           score: null,
  //           maxObtainableMarks: null,
  //           percentageScore: null,
  //           passOrFail: null,
  //         };
  //       }
  //     });
  
  //     const totalSubmissions = completedCount + incompleteCount;
  //     const completion = {
  //       percentageCompleted: totalSubmissions > 0
  //         ? Math.round((completedCount / totalSubmissions) * 100)
  //         : 0,
  //       percentageIncomplete: totalSubmissions > 0
  //         ? Math.round((incompleteCount / totalSubmissions) * 100)
  //         : 0,
  //     };
  
  //     const totalAttempts = successCount + failureCount;
  //     const successRate = {
  //       successPercentage: totalAttempts > 0
  //         ? Math.round((successCount / totalAttempts) * 100)
  //         : 0,
  //       failurePercentage: totalAttempts > 0
  //         ? Math.round((failureCount / totalAttempts) * 100)
  //         : 0,
  //     };
  
  //     if (format === 'csv') {
  //       const csv = json2csv(learnerReports);
  //       res.header('Content-Type', 'text/csv');
  //       res.attachment('course_report.csv');
  //       return res.send(csv);
  //     } else if (format === 'excel') {
  //       const worksheet = XLSX.utils.json_to_sheet(learnerReports);
  //       const workbook = XLSX.utils.book_new();
  //       XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
  //       const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  
  //       res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  //       res.attachment('course_report.xlsx');
  //       return res.send(buffer);
  //     }
  
  //     res.json({
  //       totalUsers: learnerReports.length,
  //       completion,
  //       successRate,
  //       learnerReport: learnerReports,
  //     });
  //   } catch (error: any) {
  //     console.error('Error generating report:', error);
  //     res.status(500).json({ message: 'Failed to generate report', error: error.message });
  //   }
  // }  

  // DO NOT DELETE! This is the original controller for course report when the payment has been implemented on the frontend
  async getCourseReportt(req: Request, res: Response) {
    try {
      const { courseId } = req.params;
      const { format } = req.query;
  
      const course = await Course.findById(courseId).populate<{
        learnerIds: { userId: string; progress: number }[];
      }>('learnerIds');
  
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
  
      const learnerIds = course.learnerIds.map((learner) => learner.userId.toString());
  
      const users = await User.find({ _id: { $in: learnerIds } });
  
      const submissions = await Submission.find({
        learnerId: { $in: learnerIds },
      })
      .populate<{
        learnerId: PopulatedLearner;
        assessmentId: PopulatedAssessment;
      }>('learnerId assessmentId');
        
      const latestSubmissionsMap = new Map<string, any>();
      submissions.forEach((submission) => {
        const key = `${submission.learnerId._id}_${submission.assessmentId._id}`;
        if (!latestSubmissionsMap.has(key) || submission.createdAt > latestSubmissionsMap.get(key).createdAt
      ) {
          latestSubmissionsMap.set(key, submission);
        }
      });

      const latestSubmissions = Array.from(latestSubmissionsMap.values());
  
      // Initialize counters
      let completedCount = 0;
      let incompleteCount = 0;
      let successCount = 0;
      let failureCount = 0;
  
      // Process user reports
      const userReports = users.map((user: any) => {
        const userSubmissions = latestSubmissions.filter(
          (submission) => submission.learnerId && submission.learnerId._id.toString() === user._id.toString()
        );
  
        const totalObtainedMarks = userSubmissions.reduce(
          (sum, sub) => sum + (sub.score || 0),
          0
        );
  
        const maxObtainableMarks = userSubmissions.reduce(
          (sum, sub) => sum + (sub.maxObtainableMarks || 0),
          0
        );
  
        const percentageScore =
          maxObtainableMarks > 0
            ? Math.round((totalObtainedMarks / maxObtainableMarks) * 100)
            : 0;
  
        // Update completion and success metrics
        completedCount += userSubmissions.length > 0 ? 1 : 0;
        incompleteCount += userSubmissions.length === 0 ? 1 : 0;
  
        successCount += userSubmissions.filter((sub) => (sub.score || 0) > 0).length;
        failureCount += userSubmissions.filter((sub) => (sub.score || 0) === 0).length;
  
        return {
          firstName: user.firstName,
          lastName: user.lastName,
          totalObtainedMarks,
          maxObtainableMarks,
          percentageScore,
        };
      });
  
      // Calculate overall completion rates
      const totalSubmissions = completedCount + incompleteCount;
      const completion = {
        percentageCompleted:
          totalSubmissions > 0
            ? Math.round((completedCount / totalSubmissions) * 100)
            : 0,
        percentageIncomplete:
          totalSubmissions > 0
            ? Math.round((incompleteCount / totalSubmissions) * 100)
            : 0,
      };
  
      // Calculate success rates
      const totalAttempts = successCount + failureCount;
      const successRate = {
        successPercentage:
          totalAttempts > 0
            ? Math.round((successCount / totalAttempts) * 100)
            : 0,
        failurePercentage:
          totalAttempts > 0
            ? Math.round((failureCount / totalAttempts) * 100)
            : 0,
      };

      if (format === 'csv') {
        const csv = json2csv(userReports);
        res.header('Content-Type', 'text/csv');
        res.attachment('course_report.csv');
        return res.send(csv);
      } else if (format === 'excel') {
        const worksheet = XLSX.utils.json_to_sheet(userReports);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  
        res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.attachment('course_report.xlsx');
        return res.send(buffer);
      }
  
      // Respond with the user report
      res.json({
        totalUsers: users.length,
        completion,
        successRate,
        learnerReport: userReports,
      });
    } catch (error: any) {
      console.error('Error generating report:', error);
      res.status(500).json({ message: 'Failed to generate report', error: error.message });
    }
  }
  //   try {
  //     const { courseId } = req.params;
  //     const { format } = req.query;
  
  //     // Fetch course and validate its existence
  //     const course = await Course.findById(courseId).populate<{
  //       learnerIds: { userId: string; progress: number }[];
  //     }>('learnerIds');
  
  //     if (!course) {
  //       return res.status(404).json({ message: 'Course not found' });
  //     }
  
  //     // Fetch all submissions for the course
  //     const submissions = await Submission.find({ courseId }).populate<{
  //       learnerId: IUser;
  //       assessmentId: PopulatedAssessment;
  //     }>('learnerId assessmentId');
  
  //     const latestSubmissionsMap = new Map<string, any>();
  //     submissions.forEach((submission) => {
  //       const key = `${submission.learnerId._id}_${submission.assessmentId._id}`;
  //       if (!latestSubmissionsMap.has(key) || submission.createdAt > latestSubmissionsMap.get(key).createdAt) {
  //         latestSubmissionsMap.set(key, submission);
  //       }
  //     });
  
  //     const latestSubmissions = Array.from(latestSubmissionsMap.values());
  
  //     // Initialize counters
  //     let completedCount = 0;
  //     let incompleteCount = 0;
  //     let successCount = 0;
  //     let failureCount = 0;
  
  //     const learnerReports = latestSubmissions.map((submission) => {
  //       const { learnerId, score = 0, maxObtainableMarks = 0 } = submission;
  //       const percentageScore = maxObtainableMarks > 0
  //         ? Math.round((score / maxObtainableMarks) * 100)
  //         : 0;
  
  //       const passOrFail = percentageScore >= 50 ? 'Pass' : 'Fail';
  
  //       // Update counters
  //       completedCount += 1; // Each submission counts as completed
  //       successCount += score > 0 ? 1 : 0;
  //       failureCount += score === 0 ? 1 : 0;
  
  //       return {
  //         userId: learnerId.userId,
  //         firstName: learnerId.firstName,
  //         lastName: learnerId.lastName,
  //         score,
  //         maxObtainableMarks,
  //         percentageScore,
  //         passOrFail,
  //       };
  //     });
  
  //     const totalSubmissions = completedCount + incompleteCount;
  //     const completion = {
  //       percentageCompleted: totalSubmissions > 0
  //         ? Math.round((completedCount / totalSubmissions) * 100)
  //         : 0,
  //       percentageIncomplete: totalSubmissions > 0
  //         ? Math.round((incompleteCount / totalSubmissions) * 100)
  //         : 0,
  //     };
  
  //     const totalAttempts = successCount + failureCount;
  //     const successRate = {
  //       successPercentage: totalAttempts > 0
  //         ? Math.round((successCount / totalAttempts) * 100)
  //         : 0,
  //       failurePercentage: totalAttempts > 0
  //         ? Math.round((failureCount / totalAttempts) * 100)
  //         : 0,
  //     };
  
  //     if (format === 'csv') {
  //       const csv = json2csv(learnerReports);
  //       res.header('Content-Type', 'text/csv');
  //       res.attachment('course_report.csv');
  //       return res.send(csv);
  //     } else if (format === 'excel') {
  //       const worksheet = XLSX.utils.json_to_sheet(learnerReports);
  //       const workbook = XLSX.utils.book_new();
  //       XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
  //       const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  
  //       res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  //       res.attachment('course_report.xlsx');
  //       return res.send(buffer);
  //     }
  
  //     res.json({
  //       totalUsers: learnerReports.length,
  //       completion,
  //       successRate,
  //       learnerReport: learnerReports,
  //     });
  //   } catch (error: any) {
  //     console.error('Error generating report:', error);
  //     res.status(500).json({ message: 'Failed to generate report', error: error.message });
  //   }
  // }  
  
  async beforeTheChangeGetCourseReport(req: Request, res: Response) {
    try {
      const { courseId } = req.params;
      const { format } = req.query;
  
      const course = await Course.findById(courseId).populate<{
        learnerIds: { userId: string; progress: number }[];
      }>('learnerIds');
  
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
  
      const submissions = await Submission.find({ courseId }).populate<{
        learnerId: IUser;
        assessmentId: PopulatedAssessment;
      }>('learnerId assessmentId');
  
      const latestSubmissionsMap = new Map<string, any>();
      submissions.forEach((submission) => {
        const key = `${submission.learnerId._id}_${submission.assessmentId._id}`;
        if (!latestSubmissionsMap.has(key) || submission.createdAt > latestSubmissionsMap.get(key).createdAt) {
          latestSubmissionsMap.set(key, submission);
        }
      });
  
      const latestSubmissions = Array.from(latestSubmissionsMap.values());
  
      let completedCount = 0;
      let incompleteCount = 0;
      let successCount = 0;
      let failureCount = 0;
  
      const learnerReports = latestSubmissions.map((submission) => {
        const { learnerId, score = 0, maxObtainableMarks = 0, passOrFail } = submission;
  
        const percentageScore = maxObtainableMarks > 0
          ? Math.round((score / maxObtainableMarks) * 100)
          : 0;
  
        completedCount += 1; 
        if (passOrFail === 'Pass') {
          successCount += 1;
        } else {
          failureCount += 1;
        }
  
        return {
          userId: learnerId.userId,
          firstName: learnerId.firstName,
          lastName: learnerId.lastName,
          score,
          maxObtainableMarks,
          percentageScore,
          passOrFail, 
        };
      });
  
      const totalSubmissions = completedCount + incompleteCount;
      const completion = {
        percentageCompleted: totalSubmissions > 0
          ? Math.round((completedCount / totalSubmissions) * 100)
          : 0,
        percentageIncomplete: totalSubmissions > 0
          ? Math.round((incompleteCount / totalSubmissions) * 100)
          : 0,
      };
  
      const totalAttempts = successCount + failureCount;
      const successRate = {
        successPercentage: totalAttempts > 0
          ? Math.round((successCount / totalAttempts) * 100)
          : 0,
        failurePercentage: totalAttempts > 0
          ? Math.round((failureCount / totalAttempts) * 100)
          : 0,
      };
  
      if (format === 'csv') {
        const csv = json2csv(learnerReports);
        res.header('Content-Type', 'text/csv');
        res.attachment('course_report.csv');
        return res.send(csv);
      } else if (format === 'excel') {
        const worksheet = XLSX.utils.json_to_sheet(learnerReports);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  
        res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.attachment('course_report.xlsx');
        return res.send(buffer);
      }
  
      res.json({
        totalUsers: learnerReports.length,
        completion,
        successRate,
        learnerReport: learnerReports,
      });
    } catch (error: any) {
      console.error('Error generating report:', error);
      res.status(500).json({ message: 'Failed to generate report', error: error.message });
    }
  }
}

export default new AdminController();
