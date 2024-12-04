import { Request, Response } from "express";
import { ResponseHandler } from "../middlewares/responseHandler.middleware";
import Payment from "../models/payment.model";
import AssignedBill from "../models/assignedBill.model";
import User, { IUser } from "../models/user.model";
import Course from "../models/course.model";
import Submission from "../models/submission.model";
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

  async getCourseReport(req: Request, res: Response) {
    try {
      const { courseId } = req.params;
  
      // Fetch course with learners and assessments
      const course = await Course.findById(courseId)
        .populate("learnerIds.userId")
        .populate("assessments");
  
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
  
      // Ensure `learnerIds` is defined and map only valid learners
      const learnerIds = course.learnerIds ?? [];
      const users = learnerIds.map((learner) => learner.userId).filter(Boolean); // Exclude undefined userIds
      const totalUsers = users.length;
  
      // Submissions for the course
      const submissions = await Submission.find({ courseId }).populate("learnerId");
  
      // Calculate stats
      const completedCount = learnerIds.filter(
        (learner) => learner.progress === 100
      ).length;
      const passCount = submissions.filter(
        (submission) => submission.passOrFail === "Pass"
      ).length;
  
      const completionRate = totalUsers
        ? Math.round((completedCount / totalUsers) * 100)
        : 0;
      const successRate = submissions.length
        ? Math.round((passCount / submissions.length) * 100)
        : 0;
  
      // Generate report data
      const reportData = users.map((user: any) => {
        const learner = learnerIds.find(
          (learner) =>
            learner.userId &&
            learner.userId.toString() === user._id.toString()
        );
  
        const userSubmissions = submissions.filter(
          (submission) =>
            submission.learnerId &&
            submission.learnerId.toString() === user._id.toString()
        );
  
        return {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          status: userSubmissions.length ? "Submitted" : "Not Submitted",
          progress: learner?.progress ?? 0, // Fallback to 0 if progress is undefined
          passOrFail: userSubmissions.length
            ? userSubmissions[0].passOrFail
            : null,
        };
      });
  
      // Response for API
      if (req.query.format === "json") {
        return res.json({
          totalUsers,
          completed: completedCount,
          completionRate,
          successRate,
          data: reportData,
        });
      }
  
      // Export as CSV/Excel
      const worksheet = XLSX.utils.json_to_sheet(reportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Course Report");
  
      const fileType = req.query.format === "csv" ? "csv" : "xlsx";
      const fileName = `Course_Report.${fileType}`;
      const buffer =
        fileType === "csv"
          ? XLSX.write(workbook, { bookType: "csv", type: "buffer" })
          : XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
  
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${fileName}`
      );
      res.setHeader(
        "Content-Type",
        fileType === "csv"
          ? "text/csv"
          : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      return res.send(buffer);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error", error });
    }
  }
}

export default new AdminController();
