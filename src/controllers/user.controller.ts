import { Request, Response, NextFunction } from "express";
import { ResponseHandler } from "../middlewares/responseHandler.middleware";
import User from "../models/user.model";
import Payment from "../models/payment.model";
import Bill from "../models/bill.model";

export class UserController {
  async editProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        yearOfExperience,
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
            yearOfExperience,
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
      );

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

  async billHistory (req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;

      const paidBills = await Payment.find({ userId })
      
      return ResponseHandler.success(
        res,
        paidBills,
        "Payment history fetched successfully"
      );
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'An error occurred while retrieving your bill history',
        error: error.message,
      });
    }
  }

  async dueBills (req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;

      const dueBills = await Bill.find
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'An error occurred while fetching your due bills',
        error: error.message,
      });
    }
  }

  async addCard (req: Request, res: Response, next: NextFunction) {
    try {
      
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'An error occurred adding new card',
        error: error.message,
      });
    }
  }
}
