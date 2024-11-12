import { Request, Response } from "express";
import { ResponseHandler } from "../middlewares/responseHandler.middleware";
import Payment from "../models/payment.model";
import AssignedBill from "../models/assignedBill.model";
import User, { UserDocument } from "../models/user.model";

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
      const { username, firstName, lastName, batch, role, yearOfExperience, highestEducationLevel, gender, dateOfBirth } = req.body;

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
        { $set: { username, firstName, lastName, batch, userType: role, yearOfExperience, highestEducationLevel, gender, dateOfBirth} },
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
      const organizationId = req.admin._id;
      const userId = req.params.userId;

      const user = await User.findOne({ _id: userId, organizationId });

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
}

export default new AdminController();
