import { Request, Response, NextFunction } from "express";
import { ResponseHandler } from "../middlewares/responseHandler.middleware";
import Organization, { OrganizationDocument } from "../models/organization.model";
import User, { IUser, UserDocument } from "../models/user.model"; 

export class SuperAdminController {
  static async viewOrganizations(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const organizations: OrganizationDocument[] = await Organization.find();

      const organizationData = await Promise.all(
        organizations.map(async (org: OrganizationDocument) => {
          const totalCustomers = await User.countDocuments({
            organization: org._id,
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

  static async viewUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users: UserDocument[] = await User.find();

      const userData = await Promise.all(
        users.map(async (user: UserDocument) => {
          let organizationInfo = null;

          if (user.organizationId) {
            const organization = await Organization.findById(user.organizationId);

            if (organization) {
              organizationInfo = {
                organizationId: organization._id,
                organizationName: organization.name,
              };
            }
          }

          return {
            id: user._id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            role: user.role,
            organization: organizationInfo,
          };
        })
      );

      return ResponseHandler.success(res, userData, "Users fetched successfully");
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        `Server error: ${error.message}`,
        500
      )
    }
  }

  static async customCreate (req: Request, res: Response, next: NextFunction) {
    try {
      
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        `Server error: ${error.message}`,
        500
      )
    }
  }
}

