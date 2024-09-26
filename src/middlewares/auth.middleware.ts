import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { verifyToken } from "../utils/jwt";

const SECRET_KEY = process.env.JWT_SECRET!;

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized access" });

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const authorize = (role: "user" | "admin" | "superAdmin") => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;

    if (role === 'admin' && userRole === 'superAdmin') {
      req.superAdmin = req.user;
      return next();
    }

    if (userRole === role) {
      if (role === 'admin') req.admin = req.user;
      if (role === 'superAdmin') req.superAdmin = req.user;
      return next();
    }

    return res.status(403).json({ message: 'Forbidden access' });
  };
};
