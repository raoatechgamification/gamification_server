import { Request, Response, NextFunction } from "express";
import { ResponseHandler } from "../../middlewares/responseHandler.middleware";
import SuperAdmin  from "../../models/superadmin.model"; 
import Organization from "../../models/organization.model";
import User from "../../models/user.model";
import { comparePassword, hashPassword } from "../../utils/hash";
import { generateToken } from "../../utils/jwt";

export class SuperAdminAuthController {
  static async registerSuperAdmin(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      let { email, password } = req.body;

      const existingAccount = 
        (await Organization.findOne({ email })) ||
        (await User.findOne({ email })) ||
        (await SuperAdmin.findOne({ email })) 

      if (existingAccount) {
        return ResponseHandler.failure(
          res,
          "Email already registered",
          400
        );
      }

      password = await hashPassword(password);

      const newSuperAdmin = await SuperAdmin.create({
        email,
        password,
      });

      return ResponseHandler.success(res, [], "Super admin account created", 201);
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

      const superAdmin = await SuperAdmin.findOne({ email });

      if (!superAdmin) {
        return ResponseHandler.failure(
          res,
          "Super Admin does not exist",
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

      const payload = {
        id: superAdmin._id, 
        email: superAdmin.email,
        username: superAdmin.username,
        firstName: superAdmin.firstName,
        lastName: superAdmin.lastName,
        role: superAdmin.role,
      };

      const token = await generateToken(payload);

      const adminResponse = await SuperAdmin.findOne({
        _id: superAdmin._id, 
      }).select("-password -role"); 
      
      return ResponseHandler.loginResponse(
        res,
        token,
        adminResponse,
        "Login Successful"
      );
    } catch (error) {
      next(error);
    }
  }
}
