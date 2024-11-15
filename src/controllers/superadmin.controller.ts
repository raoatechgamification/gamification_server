import { Request, Response, NextFunction } from "express";
import { ResponseHandler } from "../middlewares/responseHandler.middleware";
import Payment from "../models/payment.model";
import AssignedBill from "../models/assignedBill.model";
import Organization, {
  OrganizationDocument,
} from "../models/organization.model";
import User, { UserDocument } from "../models/user.model";
import { Parser } from "json2csv";
import ExcelJS from "exceljs";

export class SuperAdminController {
  static async viewOrganizations(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;
  
      // Parse and validate date range
      const filter: any = {};
      if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate as string);
        if (endDate) filter.createdAt.$lte = new Date(endDate as string);
      }
  
      const organizations: OrganizationDocument[] = await Organization.find(filter);
  
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
  
  static async viewUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;
  
      // Parse and validate date range
      const filter: any = {};
      if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate as string);
        if (endDate) filter.createdAt.$lte = new Date(endDate as string);
      }
  
      const users: UserDocument[] = await User.find(filter);
  
      const usersWithDetails = await Promise.all(
        users.map(async (user: UserDocument) => {
          let organizationInfo = null;
          if (user.organizationId) {
            const organization = await Organization.findById(
              user.organizationId
            ).select("-password");
            if (organization) {
              organizationInfo = organization;
            }
          }
  
          const paymentHistory = await Payment.find({ userId: user._id });
          const assignedBills = await AssignedBill.find({
            assigneeId: user._id,
          });
  
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
  
  
  // static async viewOrganizations(
  //   _req: Request,
  //   res: Response,
  //   next: NextFunction
  // ) {
  //   try {
  //     const organizations: OrganizationDocument[] = await Organization.find();

  //     const organizationData = await Promise.all(
  //       organizations.map(async (org: OrganizationDocument) => {
  //         const totalCustomers = await User.countDocuments({
  //           organizationId: org._id,
  //         });

  //         const formattedDate = new Date(org.createdAt).toLocaleDateString();

  //         return {
  //           id: org._id,
  //           name: org.name,
  //           email: org.email,
  //           phone: org.phone,
  //           preferredUrl: org.preferredUrl,
  //           referral: org.referral,
  //           referralSource: org.referralSource,
  //           totalCustomers,
  //           registeredDate: formattedDate,
  //         };
  //       })
  //     );

  //     return ResponseHandler.success(res, {
  //       message: "Organizations fetched successfully",
  //       data: organizationData,
  //     });
  //   } catch (error) {
  //     next(error);
  //   }
  // }

  // static async viewUsers(_req: Request, res: Response, next: NextFunction) {
  //   try {
  //     const users: UserDocument[] = await User.find();

  //     const usersWithDetails = await Promise.all(
  //       users.map(async (user: UserDocument) => {
  //         let organizationInfo = null;
  //         if (user.organizationId) {
  //           const organization = await Organization.findById(
  //             user.organizationId
  //           ).select("-password");
  //           if (organization) {
  //             organizationInfo = organization;
  //           }
  //           // if (organization) {
  //           //   organizationInfo = {
  //           //     organizationId: organization._id,
  //           //     organizationName: organization.name,
  //           //   };
  //           // }
  //         }

  //         const paymentHistory = await Payment.find({ userId: user._id });
  //         const assignedBills = await AssignedBill.find({
  //           assigneeId: user._id,
  //         });

  //         return {
  //           id: user._id,
  //           username: user.username,
  //           firstName: user.firstName,
  //           lastName: user.lastName,
  //           email: user.email,
  //           phone: user.phone,
  //           role: user.role,
  //           organization: organizationInfo,
  //           paymentHistory,
  //           assignedBills,
  //         };
  //       })
  //     );

  //     return ResponseHandler.success(
  //       res,
  //       usersWithDetails,
  //       "Users fetched successfully"
  //     );
  //   } catch (error: any) {
  //     return ResponseHandler.failure(
  //       res,
  //       `Server error: ${error.message}`,
  //       500
  //     );
  //   }
  // }

  static async viewAnOrganization(req: Request, res: Response) {
    try {
      const { organizationId } = req.params;

      const organization = await Organization.findOne({
        _id: organizationId,
      }).select("-password");

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

      const user = await User.findOne({ _id: userId }).select("-password");

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

      const user = await User.findOne({ _id: userId });

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
      ).select("-password");

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
      const { name, firstName, lastName, preferredUrl, industry } = req.body;

      const organization = await Organization.findOne({ _id: organizationId });

      if (!organization) {
        return ResponseHandler.failure(res, "Organization does not exist", 404);
      }

      const updatedOrganization = await Organization.findByIdAndUpdate(
        organizationId,
        { $set: { name, firstName, lastName, preferredUrl, industry } },
        { new: true, runValidators: true }
      ).select("-password");

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

      return ResponseHandler.success(res, "User deleted successfully");
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

      return ResponseHandler.success(res, "Organization deleted successfully");
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        `Server error: ${error.message}`,
        500
      );
    }
  }

  static async exportUserDataAsCsvFile(req: Request, res: Response) {
    try {
      const users = await User.find().select("-password").lean();

      const json2csvParser = new Parser();
      const csv = json2csvParser.parse([...users]);

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=data.csv");
      res.status(200).send(csv);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
      });
    }
  }

  static async exportUserDataAsExcelFile(req: Request, res: Response) {
    try {
      const users = await User.find().select("-password").lean();

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Data");

      const data = [...users];
      if (data.length > 0) {
        worksheet.columns = Object.keys(data[0]).map((key) => ({
          header: key,
          key,
        }));
        data.forEach((item) => worksheet.addRow(item));
      } else {
        worksheet.addRow(["No data available"]);
      }

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader("Content-Disposition", "attachment; filename=data.xlsx");

      await workbook.xlsx.write(res);
      res.end();
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
      });
    }
  }

  static async exportOrganizationDataAsCsvFile(req: Request, res: Response) {
    try {
      const organization = await Organization.find().select("-password").lean();

      const json2csvParser = new Parser();
      const csv = json2csvParser.parse([...organization]);

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=data.csv");
      res.status(200).send(csv);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
      });
    }
  }

  static async exportOrganizationDataAsExcelFile(req: Request, res: Response) {
    try {
      const organizations = await Organization.find()
        .select("-password")
        .lean();

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Data");

      const data = [...organizations];
      if (data.length > 0) {
        worksheet.columns = Object.keys(data[0]).map((key) => ({
          header: key,
          key,
        }));
        data.forEach((item) => worksheet.addRow(item));
      } else {
        worksheet.addRow(["No data available"]);
      }

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader("Content-Disposition", "attachment; filename=data.xlsx");

      await workbook.xlsx.write(res);
      res.end();
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
      });
    }
  }
}
