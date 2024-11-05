import { Request, Response, NextFunction } from "express";
import { ResponseHandler } from "../../middlewares/responseHandler.middleware";
import User from "../../models/user.model";
import Organization from "../../models/organization.model";
import SuperAdmin from "../../models/superadmin.model";
import UserService from "../../services/user.service";
import { comparePassword, hashPassword } from "../../utils/hash";
import { generateToken } from "../../utils/jwt";
import { sendLoginEmail } from "../../services/sendMail.service";

export class UserAuthController {
  static async createSingleUser(req: Request, res: Response) {
    try {
      const { firstName, lastName, email, role, batch, password, sendEmail } =
        req.body;

      const organizationId = req.admin._id;
      const organization = await Organization.findById(organizationId);
      if (!organization) {
        return res.status(400).json({
          status: false,
          message: "Organization not found",
        });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return ResponseHandler.failure(
          res,
          `A user has been registered with this email`,
          400
        );
      }

      let hashedPassword;

      if (password) {
        hashedPassword = await hashPassword(password);
      } else hashedPassword = await hashPassword("Default@123");

      const newUser = await User.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        batch,
        userType: role,
      });

      const userResponse = await User.findById(newUser._id).select(
        "-password -role"
      );

      if (sendEmail) {
        const emailVariables = {
          email,
          firstName,
          password,
          organizationName: organization.name,
          subject: "Gamai - Your New Account Login Details",
        };

        await sendLoginEmail(emailVariables);
      }

      return ResponseHandler.success(
        res,
        userResponse,
        "User account created successfully",
        201
      );
    } catch (error: any) {
      res.status(500).json({
        message: "Server error",
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
      res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
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
        organization: registeredUser.organization,
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
        data: createdUsers,
        message:
          "All users created successfully and emails sent with login details.",
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "An error occurred while creating bulk accounts",
        error: error.message,
      });
    }
  }
}
