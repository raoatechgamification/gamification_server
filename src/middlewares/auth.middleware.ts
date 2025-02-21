import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import User from '../models/user.model';
import Organization from "../models/organization.model";
import SuperAdmin from "../models/superadmin.model";
import SubAdmin from "../models/subadmin.model";
import Role from "../models/role.model"
import { IPermission } from "../models/permission.model"


// export const authenticate = (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const token = req.headers.authorization?.split(" ")[1];
//   if (!token) return res.status(401).json({ message: "Unauthorized access" });

//   try {
//     const decoded = verifyToken(token) as typeof User;
//     req.user = decoded;
//     next();
//   } catch (err) {
//     return res.status(401).json({ message: "Invalid token" });
//   }
// };

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized access" });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;

    if (decoded.role === "user") {
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ status: false, message: "User not found" });
      }

      if (user.isDisabled) {
        return res.status(403).json({ status: false, message: "User account is disabled" });
      }

      if (user.isArchived) {
        return res.status(403).json({ status: false, message: "User account is archived" });
      }
    }
    
    // Check if user is a subAdmin
    if (decoded.role === "subAdmin") {
      const subAdmin = await SubAdmin.findById(decoded.id).populate("permissions");
      if (!subAdmin) {
        return res.status(401).json({ message: "SubAdmin not found" });
      }
    

      if (!subAdmin.roles || subAdmin.roles.length === 0) {
        return res.status(401).json({ message: "SubAdmin has no assigned roles" });
      }
      const roleId = subAdmin.roles[0].toString(); // Converts ObjectId to string
      const organisationId = subAdmin.organizationId.toString();
      req.user.roleId = roleId;
      req.user.organizationId = organisationId;
      

      // Attach subAdmin permissions to the request object
      req.subadminPermissions = subAdmin.permissions as IPermission[];
    }

    next();
  } catch (err) {
    console.error("Authentication error:", err);
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const authorize = (roles: ("user" | "admin" | "subAdmin" | "superAdmin")[]) => {

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

    if (userRole === "subAdmin") {

      const role = await Role.findById(req.user.roleId).populate("permissions");
   
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


    console.log("Checking admin/superAdmin/user role:", req.user?.role);
    if (req.user && (req.user.role === "admin" || req.user.role === "superAdmin" || req.user.role === "user")) {
      console.log("User is admin/superAdmin/user, granting access");
      return next();
    }

    console.log("Checking if user is subAdmin:", req.user?.role);
    if (!req.user || req.user.role !== "subAdmin") {
      console.log("User is not subAdmin, denying access");
      return res.status(403).json({ success: false, message: "Forbidden access" });
    }

    console.log("Checking subadmin permissions:", req.subadminPermissions);
    if (!req.subadminPermissions || req.subadminPermissions.length === 0) {
      console.log("No permissions found for subAdmin");
      return res.status(403).json({ success: false, message: "No permissions assigned to subadmin" });
    }

    const hasPermission = req.subadminPermissions.some(
      (perm: any) => perm.module === module && perm.action === action
    );

    console.log("Checking specific permission:", { module, action, hasPermission });
    if (!hasPermission) {
      console.log("Permission denied for module:", module, "action:", action);
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
