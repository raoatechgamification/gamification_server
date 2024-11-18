import { Request, Response } from "express";
import { ResponseHandler } from "../../middlewares/responseHandler.middleware";
import User, { IUser } from "../../models/user.model";
import Organization, { IOrganization } from "../../models/organization.model";
import SuperAdmin, { ISuperAdmin } from "../../models/superadmin.model";
import UserService from "../../services/user.service";
import { comparePassword, hashPassword } from "../../utils/hash";
import { generateToken } from "../../utils/jwt";
import { sendLoginEmail } from "../../services/sendMail.service";
import {verifyEmailTemplate} from "../../utils/email"

export class UserAuthController {
  static async createSingleUser(req: Request, res: Response) {
    try {
      let { firstName, lastName, email, role, batch, password, sendEmail } =
        req.body;

      if ( !password ) {
        password = `${firstName}${lastName}@123#`
      }

      const organizationId = req.admin._id;
      const organization = await Organization.findById(organizationId);
      if (!organization) {
        return ResponseHandler.failure(res, "Organization not found", 400);
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return ResponseHandler.failure(
          res,
          `A user has been registered with this email`,
          400
        );
      }

      const hashedPassword = await hashPassword(password);

      const newUser = await User.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        organizationId,
        batch,
        userType: role,
      });

      const userResponse = await User.findById(newUser._id).select(
        "-password -role"
      );
      const url = `https://staging-gamification.netlify.app/auth/login`
      if (sendEmail) {
        const emailVariables = {
          email,
          firstName,
          password,
          organizationName: organization.name,
          subject: "Onboarding Email",
        };
        await verifyEmailTemplate(emailVariables)
        // await sendLoginEmail(emailVariables);
      }

      return ResponseHandler.success(
        res,
        userResponse,
        "User account created successfully",
        201
      );
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        `Server error: ${error.message}`,
        500
      );
    }
  }

  static async bulkCreateUsers(req: Request, res: Response) {
    try {
      const organizationId = req.admin._id;

      if (!req.file) {
        res.status(400).json({ success: false, error: "No file uploaded" });
        return;
      }

      const organization = await Organization.findById(organizationId);
      if (!organization) {
        return res.status(400).json({
          status: false,
          message: "Organization not found",
        });
      }

      const createdUsers = await UserService.createUsersFromExcel(
        organization,
        req.file.buffer
      );

      res.status(201).json({
        success: true,
        message:
          "Users created successfully and onboarding emails sent.",
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "An error occurred while creating bulk accounts",
        error: error.message,
      });
    }
  }

  static async registerUser(req: Request, res: Response) {
    try {
      let { email, username, organizationId, password } = req.body;

      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return ResponseHandler.failure(
          res,
          `A user has been registered with this email`,
          400
        );
      }

      const usernameExists = await User.findOne({ username });

      if (usernameExists) {
        return ResponseHandler.failure(
          res,
          "This username is unavailable",
          400
        );
      }

      password = await hashPassword(password);

      if (organizationId) {
        const organizationDetails = await Organization.findById(organizationId);

        if (!organizationDetails)
          return ResponseHandler.failure(
            res,
            "Organization does not exist",
            400
          );
      }

      const newUser = await User.create({
        username,
        email,
        password,
        organization: organizationId,
      });

      const userResponse = await User.findById(newUser._id).select(
        "-password -role"
      );

      return ResponseHandler.success(
        res,
        userResponse,
        "User account created successfully",
        201
      );
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        `Server error: ${error.message}`,
        500
      );
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      
      const account =
        (await Organization.findOne({ email })) ||
        (await User.findOne({ email })) ||
        (await SuperAdmin.findOne({ email }));

      if (!account) {
        return ResponseHandler.failure(res, "Account does not exist", 400);
      }

      const isCorrectPassword = await comparePassword(
        password,
        account.password
      );

      if (!isCorrectPassword) {
        return ResponseHandler.failure(
          res,
          "You have entered an incorrect password",
          400
        );
      }

      let tokenPayload;
      switch (account.role) {
        case "user":
          tokenPayload = UserAuthController.getUserTokenPayload(account);
          break;
        case "admin":
          tokenPayload =
            UserAuthController.getOrganizationTokenPayload(account);
          break;
        case "superAdmin":
          tokenPayload = UserAuthController.getSuperAdminTokenPayload(account);
          break;
        default:
          return ResponseHandler.failure(res, "Unknown role", 400);
      }

      const token = await generateToken(tokenPayload);

      const { password: _omit, ...accountData } = account.toObject();

      return ResponseHandler.loginResponse(
        res,
        token,
        accountData,
        "Login Successful"
      );
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        `Server error: ${error.message}`,
        500
      );
    }
  }

  private static getUserTokenPayload(account: IUser) {
    return {
      id: account._id,
      email: account.email,
      username: account.username,
      phone: account.phone,
      organizationId: account.organizationId,
      firstName: account.firstName,
      lastName: account.lastName,
      role: account.role,
    };
  }

  private static getOrganizationTokenPayload(account: IOrganization) {
    return {
      id: account._id,
      role: account.role,
      name: account.name,
      email: account.email,
      preferredUrl: account.preferredUrl,
    };
  }

  private static getSuperAdminTokenPayload(account: ISuperAdmin) {
    return {
      id: account._id,
      email: account.email,
      username: account.username,
      firstName: account.firstName,
      lastName: account.lastName,
      role: account.role,
    };
  }

  static async loginUser(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const registeredUser = await User.findOne({ email });

      if (!registeredUser) {
        return ResponseHandler.failure(res, "User does not exist", 400);
      }

      const checkPassword = await comparePassword(
        password,
        registeredUser.password
      );

      if (!checkPassword) {
        return ResponseHandler.failure(
          res,
          "You have entered an incorrect password",
          400
        );
      }

      const payload = {
        id: registeredUser._id,
        email: registeredUser.email,
        username: registeredUser.username,
        phone: registeredUser.phone,
        organizationId: registeredUser.organizationId,
        firstName: registeredUser.firstName,
        lastName: registeredUser.lastName,
        role: registeredUser.role,
      };

      const token = await generateToken(payload);

      const userResponse = await User.findById(registeredUser._id).select(
        "-password -role"
      );

      return ResponseHandler.loginResponse(
        res,
        token,
        userResponse,
        "Login Successful"
      );
    } catch (error: any) {
      res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  }
}
