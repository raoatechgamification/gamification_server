import { Request, Response } from "express";
import { ResponseHandler } from "../middlewares/responseHandler.middleware";
import Role from "../models/role.model";
import Permission from "../models/permission.model";
import { getOrganizationId } from "../utils/getOrganizationId.util";
import Organization from "../models/organization.model";


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

  async createRole(req: Request, res: Response) {
    try {
      const { name, permissions } = req.body;
  
      // Validate input
      if (!name || !permissions || !Array.isArray(permissions)) {
        return res.status(400).json({
          success: false,
          message: "Role name and permissions are required.",
        });
      }

      let organizationId = await getOrganizationId(req, res);
      if (!organizationId) {
        return;
      }

      const organization = await Organization.findById(organizationId);
      if (!organization) {
        return ResponseHandler.failure(res, "Organization not found", 400);
      }
  
      // Check if the role name already exists
      const existingRole = await Role.findOne({ 
        name,
        organizationId 
      });

      if (existingRole) {
        return res.status(409).json({
          success: false,
          message: "Role name already exists.",
        });
      }
  
      // Validate permissions
      const validPermissions = await Permission.find({ _id: { $in: permissions } });
      if (validPermissions.length !== permissions.length) {
        return res.status(400).json({
          success: false,
          message: "One or more permissions are invalid.",
        });
      }
  
      const newRole = new Role({
        name,
        organizationId,
        permissions: validPermissions.map((perm) => perm._id),
      });
  
      await newRole.save();
  
      res.status(201).json({
        success: true,
        message: "Role created successfully.",
        data: newRole,
      });
    } catch (error) {
      console.error("Error creating role:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred while creating the role.",
      });
    }
  }

  async getAllRoles(req: Request, res: Response) {
    try {
      let organizationId = await getOrganizationId(req, res);
      if (!organizationId) {
        return;
      }

      const organization = await Organization.findById(organizationId)
      if (!organization) {
        return ResponseHandler.failure(res, "Organization not found", 400);
      }

      const roles = await Role.find({ organizationId }).populate("permissions");

      if (!roles || roles.length === 0) {
        return ResponseHandler.failure(res, "No role found. Start by creating a role!")
      }

      ResponseHandler.success(res, roles, "Roles fetched successfully")
    } catch (error: any) {
      console.error("Error fetching roles:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred while fetching roles",
      });
    }
  }
}

export default new RolesAndPermissionsController()