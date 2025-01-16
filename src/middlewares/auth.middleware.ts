import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import User from '../models/user.model';
import Organization from "../models/organization.model";
import SuperAdmin from "../models/superadmin.model";
import SubAdmin from "../models/subadmin.model";
import { IPermission } from "../models/permission.model"


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

export const authorize = (roles: ("user" | "admin" | "subadmin" | "superAdmin")[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;

    if (!userRole) {
      return res.status(403).json({ message: "No role found for user" });
    }

    if (!roles.includes(userRole)) {
      return res.status(403).json({ message: "Forbidden access" });
    }

    if (userRole === "superAdmin") {
      const superAdmin = await SuperAdmin.findById(req.user?.id);
      if (!superAdmin) {
        return res.status(403).json({ message: "SuperAdmin not found" });
      }
      req.superAdmin = superAdmin;
    }

    if (userRole === "admin") {
      const admin = await Organization.findById(req.user?.id);
      if (!admin) {
        return res.status(403).json({ message: "Admin not found" });
      }
      req.admin = admin;
    }

    // if (userRole === "subadmin") {
    //   const role = await SubAdmin.findById(req.user?.roleId).populate<{ permissions: IPermission[] }>("permissions");
    //   if (!role) {
    //     return res.status(403).json({ message: "Subadmin role not found" });
    //   }
    //   req.subadminPermissions = role.permissions;
    // }

    if (userRole === "subadmin") {
      const role = await SubAdmin.findById(req.user?.roleId).populate("permissions");
      if (!role || !role.permissions || role.permissions.some((perm) => typeof perm === "string")) {
        return res.status(403).json({ message: "Invalid or missing permissions for subadmin" });
      }
      req.subadminPermissions = role.permissions as IPermission[];
    }    
    

    next();
  };
};

export const checkSubadminPermission = (module: string, action: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== "subadmin") {
      return res.status(403).json({ message: "Forbidden access" });
    }

    if (!req.subadminPermissions || req.subadminPermissions.length === 0) {
      return res.status(403).json({ message: "No permissions assigned to subadmin" });
    }

    const hasPermission = req.subadminPermissions.some(
      (perm: any) => perm.module === module && perm.action === action
    );

    if (!hasPermission) {
      return res.status(403).json({ message: "Permission denied" });
    }

    next();
  };
};


// export const authorize = (role: "user" | "admin" | "superAdmin") => {
//   return async (req: Request, res: Response, next: NextFunction) => {
//     const userRole = req.user?.role;

//     if (!userRole) {
//       return res.status(403).json({ message: 'No role found for user' });
//     }

//     if (role === 'admin' && userRole === 'superAdmin') {
//       const superAdmin = await SuperAdmin.findById(req.user?.id);
//       if (!superAdmin) {
//         return res.status(403).json({ message: "SuperAdmin not found" });
//       }
//       req.superAdmin = superAdmin; // Will not be null now
//       return next();
//     }

//     if (userRole === role) {
//       if (role === 'admin') {
//         const admin = await Organization.findById(req.user?.id);
//         if (!admin) {
//           return res.status(403).json({ message: "Admin not found" });
//         }
//         req.admin = admin; // Will not be null now
//       }

//       if (role === 'superAdmin') {
//         const superAdmin = await SuperAdmin.findById(req.user?.id);
//         if (!superAdmin) {
//           return res.status(403).json({ message: "SuperAdmin not found" });
//         }
//         req.superAdmin = superAdmin; // Will not be null now
//       }

//       return next();
//     }

//     return res.status(403).json({ message: "Forbidden access" });
//   };
// };
