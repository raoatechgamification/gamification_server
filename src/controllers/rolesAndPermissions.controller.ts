import { Request, Response } from "express";
import Permission from "../models/permission.model";

class RolesAndPermissionsController {
  async getAllPermissions(req: Request, res: Response) {
    try {
      // Fetch all permissions from the database
      const permissions = await Permission.find();
  
      // Group permissions by module
      const groupedPermissions = permissions.reduce((acc: any, permission) => {
        if (!acc[permission.module]) {
          acc[permission.module] = [];
        }
        acc[permission.module].push(permission.action);
        return acc;
      }, {});
  
      // Format grouped permissions as an array of objects
      const formattedPermissions = Object.keys(groupedPermissions).map((module) => ({
        module,
        actions: groupedPermissions[module],
      }));
  
      res.status(200).json({
        success: true,
        message: "Permissions fetched successfully",
        data: formattedPermissions,
      });
    } catch (error) {
      console.error("Error fetching permissions:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred while fetching permissions",
      });
    }
  }
}

export default new RolesAndPermissionsController()