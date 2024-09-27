import { Request, Response, NextFunction } from "express";
import { ResponseHandler } from "../middlewares/responseHandler.middleware";
import { v4 as uuidv4 } from "uuid";
import { User } from "../models/user.model";
import { comparePassword, hashPassword } from "../utils/hash";
import { generateToken } from "../utils/jwt";

export class UserAuthController {
  static async registerUser(req: Request, res: Response, next: NextFunction) {
    try {
      let { email, username, organization, password } = req.body;

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

      await User.create({
        id: uuidv4(),
        username,
        email,
        password,
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

      const user = await User.findOne({
        where: { email },
      });

      if (!user) {
        return ResponseHandler.failure(res, "User does not exist"), 400;
      }

      const checkPassword = await comparePassword(
        password,
        user.password
      );

      if (!checkPassword) {
        return ResponseHandler.failure(
          res,
          "You have entered an incorrect password",
          400
        );
      }

      const token = await generateToken(user);
      const learner = await User.findOne({
        where: { email },
        attributes: { exclude: ["password", "role"] },
      });

      return ResponseHandler.loginResponse(
        res,
        token,
        learner,
        "You have successfully logged in"
      );
    } catch (error) {
      next(error);
    }
  }
}
