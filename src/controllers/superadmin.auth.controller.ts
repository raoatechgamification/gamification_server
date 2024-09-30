import { Request, Response, NextFunction } from "express";
import { ResponseHandler } from "../middlewares/responseHandler.middleware";
import { v4 as uuidv4 } from "uuid";
import { SuperAdmin } from "../models/superadmin.model";
import { comparePassword, hashPassword } from "../utils/hash";
import { generateToken } from "../utils/jwt";

export class SuperAdminController {
  static async registerSuperAdmin(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      let { email, password } = req.body;

      const superAdmin = await SuperAdmin.findOne({
        where: { email },
      });

      if (superAdmin) {
        return ResponseHandler.failure(
          res,
          "Email already registered, kindly sign in to proceed",
          400
        );
      }

      password = await hashPassword(password);

      await SuperAdmin.create({
        id: uuidv4(),
        email,
        password,
      });

      return ResponseHandler.success(res, "Super admin account created");
    } catch (error) {
      next(error);
    }
  }

  static async loginSuperAdmin(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { email, password } = req.body;

      const superAdmin = await SuperAdmin.findOne({
        where: { email },
      });

      if (!superAdmin) {
        return ResponseHandler.failure(
          req,
          "Super Admin does not exist with this email",
          400
        );
      }

      const checkPassword = await comparePassword(
        password,
        superAdmin.password
      );

      if (!checkPassword) {
        return ResponseHandler.failure(
          res,
          "You have entered an incorrect password",
          400
        );
      }

      const token = await generateToken(superAdmin);
      const adminstrator = await SuperAdmin.findOne({
        where: { email },
        attributes: { exclude: ["password", "role"] },
      });

      return ResponseHandler.loginResponse(
        res,
        token,
        adminstrator,
        "Login Successful"
      );
    } catch (error) {
      next(error);
    }
  }
}
