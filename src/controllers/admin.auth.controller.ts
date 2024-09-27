import { Request, Response, NextFunction } from "express";
import { ResponseHandler } from "../middlewares/responseHandler.middleware";
import { v4 as uuidv4 } from "uuid";
import { Organization } from "../models/organization.model";
import { hashPassword, comparePassword } from "../utils/hash";
import { generateToken } from "../utils/jwt";

export class AdminAuthController {
  static async registerOrganization(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      let {
        name,
        email,
        phone,
        preferredUrl,
        password,
        confirmPassword,
        referral,
        referralSource,
      } = req.body;

      const emailExists = await Organization.findOne({
        where: { email },
      });

      if (emailExists) {
        return ResponseHandler.failure(
          res,
          "An Organization with this email already exists",
          400
        );
      }

      const phoneExists = await Organization.findOne({
        where: { phone },
      });

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

      password = await hashPassword(password);
      await Organization.create({
        id: uuidv4(),
        name,
        email,
        phone,
        preferredUrl,
        password,
        referral,
        referralSource,
      });

      const organization = await Organization.findOne({
        where: { email },
        attributes: { exclude: ["password", "role"] },
      });

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

      const registeredOrganization = await Organization.findOne({
        where: { email },
      });

      if (!registeredOrganization) {
        return ResponseHandler.failure(
          res,
          "The email you entered does not exist",
          400
        );
      }

      const checkPassword = await comparePassword(
        password,
        registeredOrganization.password
      );

      if (!checkPassword) {
        return ResponseHandler.failure(
          res,
          "You have entered an incorrect password",
          400
        );
      }

      // const payload = { ...registeredOrganization, role: "admin" };
      const token = await generateToken(registeredOrganization);

      const organization = await Organization.findOne({
        where: { email },
        attributes: { exclude: ["password", "role"] },
      });

      return ResponseHandler.loginResponse(
        res,
        token,
        organization,
        "You have successfully logged in"
      );
    } catch (error) {
      next(error);
    }
  }
}
