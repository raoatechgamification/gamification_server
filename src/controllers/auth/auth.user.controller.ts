import { Request, Response, NextFunction } from "express";
import { ResponseHandler } from "../../middlewares/responseHandler.middleware";
import User from "../../models/user.model"; 
import Organization from "../../models/organization.model"; 
import UserService from "../../services/user.service";
import { comparePassword, hashPassword } from "../../utils/hash";
import { generateToken } from "../../utils/jwt";

export class UserAuthController {
  static async registerUser (req: Request, res: Response, next: NextFunction) {
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

      const userResponse = await User.findById(newUser._id).select("-password -role");

      return ResponseHandler.success(
        res,
        userResponse,
        "User account created successfully",
        201
      );
    } catch (error) {
      next(error);
    }
  }

  static async loginUser (req: Request, res: Response, next: NextFunction) {
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

      const userResponse = await User.findById(registeredUser._id).select("-password -role");

      return ResponseHandler.loginResponse(
        res,
        token,
        userResponse,
        "Login Successful"
      );
    } catch (error) {
      next(error);
    }
  }

  static async bulkCreateUsers (req: Request, res: Response) {
    try {
      // Get organization name
      const organizationId = req.admin._id

      if (!req.file) {
        res.status(400).json({ success: false, error: "No file uploaded" });
        return;
      }

      const createdUsers = await UserService.createUsersFromExcel(organizationId, req.file.path)
      res.status(201).json({ status: true, error: "An error occurred while creating users"}) 
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'An error occurred while creating bulk accounts',
        error: error.message,
      });
    }
  }
}
