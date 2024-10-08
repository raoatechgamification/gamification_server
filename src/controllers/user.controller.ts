import { Request, Response, NextFunction } from "express";
import { ResponseHandler } from "../middlewares/responseHandler.middleware";
import User from "../models/user.model";

export class UserController {
  static async editProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        yearOfExperience,
        highestEducationLevel,
        gender,
        dateOfBirth,
        username,
        firstName,
        lastName,
        phoneNumber,
      } = req.body;

      const userId = req.user._id;
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
            phoneNumber,
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
}
