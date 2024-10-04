import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import User from '../models/user.model';
import Organization from "../models/organization.model";
import SuperAdmin from "../models/superadmin.model";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized access" });

  try {
    const decoded = verifyToken(token) as typeof User;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const authorize = (role: "user" | "admin" | "superAdmin") => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;

    if (!userRole) {
      return res.status(403).json({ message: 'No role found for user' });
    }

    if (role === 'admin' && userRole === 'superAdmin') {
      const superAdmin = await SuperAdmin.findById(req.user?.id);
      if (!superAdmin) {
        return res.status(403).json({ message: "SuperAdmin not found" });
      }
      req.superAdmin = superAdmin; // Will not be null now
      return next();
    }

    if (userRole === role) {
      if (role === 'admin') {
        const admin = await Organization.findById(req.user?.id);
        if (!admin) {
          return res.status(403).json({ message: "Admin not found" });
        }
        req.admin = admin; // Will not be null now
      }

      if (role === 'superAdmin') {
        const superAdmin = await SuperAdmin.findById(req.user?.id);
        if (!superAdmin) {
          return res.status(403).json({ message: "SuperAdmin not found" });
        }
        req.superAdmin = superAdmin; // Will not be null now
      }

      return next();
    }

    return res.status(403).json({ message: "Forbidden access" });
  };
};
