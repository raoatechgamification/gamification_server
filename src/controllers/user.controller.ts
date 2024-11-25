import { Request, Response, NextFunction } from "express";
import { ResponseHandler } from "../middlewares/responseHandler.middleware"
import User from "../models/user.model";
import Payment from "../models/payment.model";
import AssignedBill from "../models/bill.model";
import { comparePassword, hashPassword } from "../utils/hash"

export class UserController {
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

  async billHistory (req: Request, res: Response) {
    try {
      const userId = req.user.id;

      const paidBills = await AssignedBill.find({ assigneeId: userId, status: "paid" })

      if ( paidBills.length === 0 ) return ResponseHandler.failure(res, "Your payment history is empty", 404)
      
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

  async viewBill (req: Request, res: Response) {
    try {
      const { paymentId } = req.params;
      const userId = req.user.id;

      const paymentDetails = await Payment.findOne({ _id: paymentId })

      if ( !paymentDetails ) return ResponseHandler.failure(res, "Payment not found", 404)

      return ResponseHandler.success(
        res,
        paymentDetails,
        "Payment details fetched successfully"
      );
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'An error occurred while retrieving bill details',
        error: error.message,
      });
    }
  }

  async dueBills (req: Request, res: Response) {
    try {
      const userId = req.user.id;

      const dueBills = await AssignedBill.find({ assigneeId: userId, status: "unpaid" })

      // The assigneeId can also be an organization, i.e. when assigneeType is 'group'

      if ( dueBills.length === 0 ) return ResponseHandler.failure(res, "Your payment history is empty", 404)
        
      return ResponseHandler.success(
        res,
        dueBills,
        "Payment history fetched successfully"
      );
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'An error occurred while fetching your due bills',
        error: error.message,
      });
    }
  }

  async updatePassword (req: Request, res: Response) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      const user = await User.findById(userId)
      if ( !user ) return ResponseHandler.failure(res, "User not found", 404);

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

      const newHashedPassword = await hashPassword(newPassword)
      user.password = newHashedPassword;
      user.save()

      const userResponse = await User.findById(user._id).select("-password -role");
      return ResponseHandler.success(
        res, 
        userResponse,
        "Your password has been updated successfully",
        200 
      )
    } catch (error: any) {
      res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  }

  // async userPrograms (req: Request, res: Response) {
  //   try {
  //     const userId = req.user.id;

  //     const user = await User.findById(userId)
  //     if ( !user ) return ResponseHandler.failure(res, "User not found", 404);

  //     const userPrograms = await User.find(userId).select("+ongoingPrograms +completedPrograms")
  //     if (!userPrograms) {
  //       return ResponseHandler.success(
  //         res, 
  //         "No have to ongoing nor completed programs. Enroll in a program today."
  //       )
  //     }

  //     return ResponseHandler.success(
  //       res, 
  //       userPrograms,
  //       "Your password has been updated successfully",
  //       200 
  //     )
  //   } catch (error: any) {
  //     res.status(500).json({
  //       message: "Server error",
  //       error: error.message,
  //     });
  //   }
  // }

  async userPrograms(req: Request, res: Response) {
    try {
      const userId = req.user.id;
  
      const user = await User.findById(userId).select(
        "+ongoingPrograms +completedPrograms"
      );
  
      if (!user) {
        return ResponseHandler.failure(res, "User not found", 404);
      }
  
      if (!user.ongoingPrograms?.length && !user.completedPrograms?.length) {
        return ResponseHandler.success(
          res,
          null,
          "You have no ongoing or completed programs. Enroll in a program today.",
          200
        );
      }
  
      const userPrograms = {
        ongoingPrograms: user.ongoingPrograms || [],
        completedPrograms: user.completedPrograms || [],
      };
  
      return ResponseHandler.success(
        res,
        userPrograms,
        "Programs retrieved successfully",
        200
      );
    } catch (error: any) {
      console.error("Error retrieving user programs:", error.message);
      return ResponseHandler.failure(res, "Server error", 500);
    }
  }  

  
}
