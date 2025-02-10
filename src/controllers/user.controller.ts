import { NextFunction, Request, Response } from "express";
import { ResponseHandler } from "../middlewares/responseHandler.middleware";
import AssignedBill from "../models/bill.model";
import { ICourse } from "../models/course.model";
import Lesson, { LessonDocument } from "../models/lesson.model";
import Payment from "../models/payment.model";
import User from "../models/user.model";
import { comparePassword, hashPassword } from "../utils/hash";

interface CompletionDetails {
  userId: string;
  percentage: number;
}

interface Lesson {
  _id: string;
  title: string;
  completionDetails: CompletionDetails[];
}

type PopulatedCourse = Omit<ICourse, "lessons"> & {
  lessons: LessonDocument[];
};

export class UserController {
  async getAUserProfileForUser(req: Request, res: Response) {
    try {
      const organizationId = req.params.organisationID;

      const userId = req.user.id;
      console.log(userId, 31);
      const user = await User.findOne({ _id: userId }).select("-password");

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

  async editProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        yearsOfExperience,
        highestEducationLevel,
        gender,
        dateOfBirth,
        username,
        firstName,
        lastName,
        phone,
      } = req.body;

      const userId = req.user.id;
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            yearsOfExperience,
            highestEducationLevel,
            gender,
            dateOfBirth,
            username,
            firstName,
            lastName,
            phone,
          },
        },
        { new: true, runValidators: true }
      ).select("-password");

      if (!updatedUser) {
        return ResponseHandler.failure(res, "User not found", 404);
      }

      return ResponseHandler.success(
        res,
        updatedUser,
        "Profile updated successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  async billHistory(req: Request, res: Response) {
    try {
      const userId = req.user.id;

      const paidBills = await AssignedBill.find({
        assigneeId: userId,
        status: "paid",
      });

      if (paidBills.length === 0)
        return ResponseHandler.failure(res, "Your bill history is empty", 404);

      return ResponseHandler.success(
        res,
        paidBills,
        "Payment history fetched successfully"
      );
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "An error occurred while retrieving your bill history",
        error: error.message,
      });
    }
  }

  async viewBill(req: Request, res: Response) {
    try {
      const { paymentId } = req.params;
      const userId = req.user.id;

      const paymentDetails = await Payment.findOne({ _id: paymentId });

      if (!paymentDetails)
        return ResponseHandler.failure(res, "Payment not found", 404);

      return ResponseHandler.success(
        res,
        paymentDetails,
        "Payment details fetched successfully"
      );
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "An error occurred while retrieving bill details",
        error: error.message,
      });
    }
  }

  async dueBills(req: Request, res: Response) {
    try {
      const userId = req.user.id;

      const dueBills = await AssignedBill.find({
        assigneeId: userId,
        status: "unpaid",
      });

      // The assigneeId can also be an organization, i.e. when assigneeType is 'group'

      if (dueBills.length === 0)
        return ResponseHandler.failure(
          res,
          "Your payment history is empty",
          404
        );

      return ResponseHandler.success(
        res,
        dueBills,
        "Payment history fetched successfully"
      );
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "An error occurred while fetching your due bills",
        error: error.message,
      });
    }
  }

  async updatePassword(req: Request, res: Response) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      const user = await User.findById(userId);
      if (!user) return ResponseHandler.failure(res, "User not found", 404);

      const hashedPassword = user.password;

      const currentPasswordIsValid = await comparePassword(
        currentPassword,
        hashedPassword
      );

      if (!currentPasswordIsValid) {
        return ResponseHandler.failure(
          res,
          "The current password you entered is incorrect",
          400
        );
      }

      const newHashedPassword = await hashPassword(newPassword);
      user.password = newHashedPassword;
      user.save();

      const userResponse = await User.findById(user._id).select(
        "-password -role"
      );
      return ResponseHandler.success(
        res,
        userResponse,
        "Pssword updated successfully",
        200
      );
    } catch (error: any) {
      res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  }

  async getAllUserCertificates(req: Request, res: Response) {
    try {
      const userId = req.user.id;

      const user = await User.findById(userId, { certificates: 1, _id: 0 });

      if (!user) {
        return ResponseHandler.failure(res, "User not found", 404);
      }

      return ResponseHandler.success(
        res,
        user.certificates,
        "Certificates retrieved successfully.",
        200
      );
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        `Error generating user certificates: ${error.message}`,
        500
      );
    }
  }
}
