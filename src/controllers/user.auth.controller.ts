import { Request, Response, NextFunction } from "express";
import { ResponseHandler } from "../middlewares/responseHandler.middleware";
import { v4 as uuidv4 } from "uuid";
import { User } from "../models/user.model";
import { Organization } from "../models/organization.model";
import { comparePassword, hashPassword } from "../utils/hash";
import { generateToken } from "../utils/jwt";

export class UserAuthController {
  static async registerUser(req: Request, res: Response, next: NextFunction) {
    try {
      let { email, username, organizationId, password } = req.body;

      const existingUser = await User.findOne({
        where: { email },
      });

      if (existingUser) {
        return ResponseHandler.failure(
          res,
          `A user has been registered with this email`,
          400
        );
      }

      const usernameExists = await User.findOne({
        where: { username },
      });

      if (usernameExists) {
        return ResponseHandler.failure(
          res,
          "This username is unavailable",
          400
        );
      }

      password = await hashPassword(password);
      let organizations: string[] = [];

      if (organizationId) {
        const organizationDetails = await Organization.findOne({
          where: { id: organizationId }
        })

        if (!organizationDetails) return ResponseHandler.failure(
          res, 
          "Organization does not exist",
          400
        )

        organizations.push(organizationId);
      }

      await User.create({
        id: uuidv4(),
        username,
        email,
        password,
        organizations,
      });

      const user = await User.findOne({
        where: { email },
        attributes: { exclude: ["password", "role"] },
      });

      return ResponseHandler.success(
        res,
        user,
        "User account created successfully",
        201
      );
    } catch (error) {
      next(error);
    }
  }

  static async loginUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      const registeredUser = await User.findOne({
        where: { email },
      });

      if (!registeredUser) {
        return ResponseHandler.failure(res, "User does not exist"), 400;
      }

      const checkPassword = await comparePassword(password, registeredUser.password);

      if (!checkPassword) {
        return ResponseHandler.failure(
          res,
          "You have entered an incorrect password",
          400
        );
      }

      const payload = {
        id: registeredUser.id,
        email: registeredUser.email, 
        user: registeredUser.username,
        phone: registeredUser.phone,
        organizations: registeredUser.organizations,
        firstName: registeredUser.firstName,
        lastName: registeredUser.lastName
      }

      const token = await generateToken(payload);
      const learner = await User.findOne({
        where: { email },
        attributes: { exclude: ["password", "role"] },
      });

      return ResponseHandler.loginResponse(
        res,
        token,
        learner,
        "Login Successful"
      );
    } catch (error) {
      next(error);
    }
  }
}
