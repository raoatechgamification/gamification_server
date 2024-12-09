import { Request, Response } from "express";
import { ResponseHandler } from "../middlewares/responseHandler.middleware";
import Payment from "../models/payment.model";
import AssignedBill from "../models/assignedBill.model";
import User, { IUser } from "../models/user.model";
import Course from "../models/course.model";
import Submission, { PopulatedLearner, PopulatedAssessment } from "../models/submission.model";
import { parse as json2csv } from 'json2csv';
import * as XLSX from "xlsx";

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
  
  async getCourseReport(req: Request, res: Response) {
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
