import { Request, Response} from "express";
import { ResponseHandler } from "../middlewares/responseHandler.middleware";
import User, { IUser, UserDocument } from "../models/user.model";
import Organization, { IOrganization } from "models/organization.model";

class AdminController {
  async viewAllUsers (req: Request, res: Response) {
    try {
      const organizationId = req.admin._id

      const users: UserDocument[] = await User.find({ organizationId })

      if (!users) {
        return ResponseHandler.failure(
          res, 
          "You have no user under your organization, start by creating users",
          400
        )
      }

      return ResponseHandler.success(res, users, "Users fetched successfully")
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        `Server error: ${error.message}`,
        500
      )
    }
  }

  async editUserProfile (req: Request, res: Response) {
    try {
      const organizationId = req.admin._id

      const userId = req.params.userId

      const { firstName, lastName, batch, role } = req.body;

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            firstName,
            lastName,
            batch,
            role
          },
        },
        { new: true, runValidators: true } 
      )

      if (!updatedUser) {
        return ResponseHandler.failure(res, "User not found", 404);
      }

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
      )
    }
  }
}

export default new AdminController();