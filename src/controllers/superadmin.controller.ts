import { Request, Response, NextFunction } from "express";
import { ResponseHandler } from "../middlewares/responseHandler.middleware";
import Payment from "../models/payment.model";
import AssignedBill from "../models/assignedBill.model";
import Organization, {
  OrganizationDocument,
} from "../models/organization.model";
import User, { UserDocument } from "../models/user.model";
import { exportDataAsCSV, exportDataAsExcel } from "../services/exportData.service";

export class SuperAdminController {
  static async viewOrganizations(
    _req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const organizations: OrganizationDocument[] = await Organization.find();

      const organizationData = await Promise.all(
        organizations.map(async (org: OrganizationDocument) => {
          const totalCustomers = await User.countDocuments({
            organizationId: org._id,
          });

          const formattedDate = new Date(org.createdAt).toLocaleDateString();

          return {
            id: org._id,
            name: org.name,
            email: org.email,
            phone: org.phone,
            preferredUrl: org.preferredUrl,
            referral: org.referral,
            referralSource: org.referralSource,
            totalCustomers,
            registeredDate: formattedDate,
          };
        })
      );

      return ResponseHandler.success(res, {
        message: "Organizations fetched successfully",
        data: organizationData,
      });
    } catch (error) {
      next(error);
    }
  }

  static async viewUsers(_req: Request, res: Response, next: NextFunction) { 
    try {
      const users: UserDocument[] = await User.find();
  
      const usersWithDetails = await Promise.all(
        users.map(async (user: UserDocument) => {
          let organizationInfo = null;
          if (user.organizationId) {
            const organization = await Organization.findById(user.organizationId).select("-password");
            if (organization) {
              organizationInfo = organization
            }
            // if (organization) {
            //   organizationInfo = {
            //     organizationId: organization._id,
            //     organizationName: organization.name,
            //   };
            // }
          }
  
          const paymentHistory = await Payment.find({ userId: user._id });
          const assignedBills = await AssignedBill.find({ assigneeId: user._id });
  
          return {
            id: user._id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            role: user.role,
            organization: organizationInfo,
            paymentHistory,
            assignedBills,
          };
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

  static async viewAnOrganization(req: Request, res: Response) {
    try {
      const { organizationId } = req.params;

      const organization = await Organization.findOne({ _id: organizationId }).select(
        "-password"
      );

      if (!organization) {
        return ResponseHandler.failure(res, "Organization does not exist", 404);
      }

      return ResponseHandler.success(
        res,
        organization,
        "Organization fetched successfully"
      );
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        `Server error: ${error.message}`,
        500
      );
    }
  }

  static async viewAUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const user = await User.findOne({ _id: userId }).select(
        "-password"
      );

      if (!user) {
        return ResponseHandler.failure(res, "User does not exist", 404);
      }

      return ResponseHandler.success(res, user, "User fetched successfully");
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        `Server error: ${error.message}`,
        500
      );
    }
  }

  static async updateAUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const {
        username,
        firstName,
        lastName,
        batch,
        role,
        yearsOfExperience,
        highestEducationLevel,
        gender,
        dateOfBirth,
      } = req.body;

      const user = await User.findOne({ _id: userId })

      if (!user) {
        return ResponseHandler.failure(res, "User does not exist", 404);
      }

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            username,
            firstName,
            lastName,
            batch,
            userType: role,
            yearsOfExperience,
            highestEducationLevel,
            gender,
            dateOfBirth,
          },
        },
        { new: true, runValidators: true }
      ).select(
        "-password"
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

  static async updateAnOrganization(req: Request, res: Response) {
    try {
      const { organizationId } = req.params;
      const { name, firstName, lastName, preferredUrl, industry } =
        req.body;

      const organization = await Organization.findOne({ _id: organizationId });

      if (!organization) {
        return ResponseHandler.failure(res, "Organization does not exist", 404);
      }

      const updatedOrganization = await Organization.findByIdAndUpdate(
        organizationId,
        { $set: { name, firstName, lastName, preferredUrl, industry } },
        { new: true, runValidators: true }
      ).select(
        "-password"
      );

      return ResponseHandler.success(
        res,
        updatedOrganization,
        "Organization details updated successfully"
      );
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        `Server error: ${error.message}`,
        500
      );
    }
  }

  static async deleteAUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const user = await User.findOne({ _id: userId });

      if (!user) {
        return ResponseHandler.failure(res, "User not found", 404);
      }

      await User.findByIdAndDelete(userId);

      return ResponseHandler.success(
        res,
        "User deleted successfully"
      );
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        `Server error: ${error.message}`,
        500
      );
    }
  }

  static async deleteAnOrganization(req: Request, res: Response) {
    try {
      const { organizationId } = req.params;

      const organization = await Organization.findOne({ _id: organizationId });

      if (!organization) {
        return ResponseHandler.failure(res, "Organization not found", 404);
      }

      await Organization.findByIdAndDelete(organizationId);

      return ResponseHandler.success(
        res,
        "Organization deleted successfully"
      );
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        `Server error: ${error.message}`,
        500
      );
    }
  }

  static async exportDataAsCsvFile(req: Request, res: Response) {
    try {
      const { data } = req.body;
      if (!data || !Array.isArray(data)) {
        return ResponseHandler.failure(res, "Invalid data format", 400);
      }
      res.setHeader("Content-Disposition", "attachment; filename=data.csv");
      res.setHeader("Content-Type", "text/csv");
      await exportDataAsCSV(data, res)
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        `Server error: ${error.message}`,
        500
      );
    }
  }

  static async exportDataAsExcelFile(req: Request, res: Response) {
    try {
      const { data } = req.body;
      if (!data || !Array.isArray(data)) {
        return ResponseHandler.failure(res, "Invalid data format", 400);
      }
      res.setHeader("Content-Disposition", "attachment; filename=data.csv");
      res.setHeader("Content-Type", "data.xlsx");
      await exportDataAsExcel(data, res)
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        `Server error: ${error.message}`,
        500
      );
    }
  }
}
