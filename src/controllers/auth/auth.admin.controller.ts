import { Request, Response, NextFunction } from "express";
import { ResponseHandler } from "../../middlewares/responseHandler.middleware";
import Organization, { IOrganization } from "../../models/organization.model";
import { hashPassword, comparePassword } from "../../utils/hash";
import { generateToken } from "../../utils/jwt";
import { sendOrganizationOnboardingMail } from "../../services/sendMail.service";

export class AdminAuthController {
  static async registerOrganization(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const {
        name,
        email,
        phone,
        preferredUrl,
        password,
        confirmPassword,
        referral,
        referralSource,
      } = req.body;
      
      console.log("Organization password", password)

      const emailExists = await Organization.findOne({ email });
      if (emailExists) {
        return ResponseHandler.failure(
          res,
          "An Organization with this email already exists",
          400
        );
      }

      const phoneExists = await Organization.findOne({ phone });
      if (phoneExists) {
        return ResponseHandler.failure(
          res,
          "Phone number is already registered",
          400
        );
      }

      if (password !== confirmPassword) {
        return ResponseHandler.failure(res, "Passwords do not match", 400);
      }

      const hashedPassword = await hashPassword(password);

      const newOrganization = await Organization.create({
        name,
        email,
        phone,
        preferredUrl,
        password: hashedPassword,
        referral,
        referralSource,
        role: "admin",
      });

      const organization: IOrganization | null = await Organization.findById(
        newOrganization._id
      ).select("-password");

      const emailVariables = {
        email,
        password,
        organizationName: name,
        subject: "Welcome to Gamai!",
      };

      console.log("Sending email with password:", emailVariables.password);
      await sendOrganizationOnboardingMail(emailVariables);

      return ResponseHandler.success(
        res,
        organization,
        "Organization created successfully",
        201
      );
    } catch (error) {
      next(error);
    }
  }

  static async loginOrganization(
    req: Request,
    res: Response, 
    next: NextFunction
  ) {
    try {
      const { email, password } = req.body;

      const registeredOrganization: IOrganization | null =
        await Organization.findOne({
          email,
        });

      if (!registeredOrganization) {
        return ResponseHandler.failure(
          res,
          "The email you entered does not exist",
          400
        );
      }

      const isPasswordValid = await comparePassword(
        password,
        registeredOrganization.password
      );

      if (!isPasswordValid) {
        return ResponseHandler.failure(
          res,
          "You have entered an incorrect password",
          400
        );
      }

      const payload = {
        id: registeredOrganization._id,
        role: registeredOrganization.role,
        name: registeredOrganization.name,
        email: registeredOrganization.email,
        preferredUrl: registeredOrganization.preferredUrl,
      };

      const token = await generateToken(payload);

      const response = await Organization.findById(
        registeredOrganization._id
      ).select("-password -role");

      return ResponseHandler.loginResponse(
        res,
        token,
        response,
        "You have successfully logged in"
      );
    } catch (error) {
      next(error);
    }
  }
}
