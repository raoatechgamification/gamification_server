import { Request, Response } from "express";
import mongoose from "mongoose";
import { ResponseHandler } from "../middlewares/responseHandler.middleware";
import Role from "../models/role.model";
import SubAdmin from "../models/subadmin.model";
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
        acc[permission.module].push({ id: permission._id, action: permission.action });
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

      return ResponseHandler.success(
        res,
        newRole,
        "Role created successfully.",
        201
      );
    } catch (error: any) {
      console.error("Error creating role:", error);
      return ResponseHandler.failure(
        res,
        error.message || "An error occurred while creating the role.",
        error.status || 500
      );
    }
  }

  // async editRole(req: Request, res: Response) {
  //   try {
  //     const { roleId } = req.params;
  //     const { name, permissions } = req.body;

  //     // Validate input
  //     if (!name || !permissions || !Array.isArray(permissions)) {
  //       return res.status(400).json({
  //         success: false,
  //         message: "Role name and permissions are required.",
  //       });
  //     }

  //     let organizationId = await getOrganizationId(req, res);
  //     if (!organizationId) {
  //       return;
  //     }

  //     // Find the role to update
  //     const role = await Role.findOne({ _id: roleId, organizationId });
  //     if (!role) {
  //       return ResponseHandler.failure(res, "Role not found", 404);
  //     }

  //     // Check if the new role name already exists for the organization
  //     const existingRole = await Role.findOne({ name, organizationId, _id: { $ne: roleId } });
  //     if (existingRole) {
  //       return res.status(409).json({
  //         success: false,
  //         message: "Role name already exists.",
  //       });
  //     }

  //     // Validate permissions
  //     const validPermissions = await Permission.find({ _id: { $in: permissions } });
  //     if (validPermissions.length !== permissions.length) {
  //       return res.status(400).json({
  //         success: false,
  //         message: "One or more permissions are invalid.",
  //       });
  //     }

  //     // Update the role details
  //     role.name = name;
  //     role.permissions = validPermissions.map((perm) => perm._id);

  //     await role.save();

  //     return ResponseHandler.success(
  //       res,
  //       role,
  //       "Role updated successfully."
  //     );
  //   } catch (error: any) {
  //     console.error("Error updating role:", error);
  //     return ResponseHandler.failure(
  //       res,
  //       error.message || "An error occurred while updating the role.",
  //       error.status || 500
  //     );
  //   }
  // }

  async editRole(req: Request, res: Response) {
    try {
      const { id } = req.params;
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

      // Find the role to update
      const role = await Role.findOne({ _id: id, organizationId });
      if (!role) {
        return ResponseHandler.failure(res, "Role not found", 404);
      }

      // Check if the new role name already exists for the organization
      const existingRole = await Role.findOne({ name, organizationId, _id: { $ne: id } });
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

      // Update the role details
      role.name = name;
      role.permissions = validPermissions.map((perm) => perm._id as mongoose.Types.ObjectId);

      await role.save();

      return ResponseHandler.success(
        res,
        role,
        "Role updated successfully."
      );
    } catch (error: any) {
      console.error("Error updating role:", error);
      return ResponseHandler.failure(
        res,
        error.message || "An error occurred while updating the role.",
        error.status || 500
      );
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
      return ResponseHandler.failure(
        res,
        error.message || "An error occurred while fetching roles.",
        error.status || 500
      );
    }
  }

  async getRole(req: Request, res: Response) {
    try {
      let organizationId = await getOrganizationId(req, res);
      if (!organizationId) {
        return;
      }

      const organization = await Organization.findById(organizationId);
      if (!organization) {
        return ResponseHandler.failure(res, "Organization not found", 400);
      }

      const { id } = req.params;

      const role = await Role.findOne({
        _id: id,
        organizationId
      }).populate("permissions")

      if (!role) {
        return ResponseHandler.failure(res, "Role not found or not found within your organization", 403)
      }

      return ResponseHandler.success(
        res,
        role,
        "Role fetched successfully"
      )
    } catch (error: any) {
      console.error("Error fetching role:", error);
      return ResponseHandler.failure(
        res,
        error.message || "An error occurred while fetching role.",
        error.status || 500
      );
    }
  }

  async deleteRole(req: Request, res: Response) {
    try {
      let organizationId = await getOrganizationId(req, res);
      if (!organizationId) {
        return;
      }

      const organization = await Organization.findById(organizationId);
      if (!organization) {
        return ResponseHandler.failure(res, "Organization not found", 400);
      }

      const { id } = req.params

      const deletedRole = await Role.findOneAndDelete({
        _id: id,
        organizationId
      })

      console.log("Deleted role: ", deletedRole)

      if (!deletedRole) {
        return ResponseHandler.failure(res, "Role not found or not found within your organization", 403)
      }

      return ResponseHandler.success(
        res,
        [],
        "Role deleted successfully"
      )
    } catch (error: any) {
      console.error("Error deleting role:", error);
      return ResponseHandler.failure(
        res,
        error.message || "An error occurred while deleting role.",
        error.status || 500
      );
    }
  }

  async assignRoleToASubAdmin(req: Request, res: Response) {
    try {
      const { roleId, subAdminId } = req.params;
      const organizationId = req.admin._id;

      if (!roleId || !subAdminId) {
        return ResponseHandler.failure(res, "Role ID and SubAdmin ID are required", 400);
      }

      const role = await Role.findOne({
        _id: roleId,
        organizationId
      }).populate("permissions")

      if (!role) return ResponseHandler.failure(res, "Role not found", 400)

      const subAdmin = await SubAdmin.findById(subAdminId);
      if (!subAdmin) {
        return ResponseHandler.failure(res, "SubAdmin not found", 404);
      }

      const permissionIds = role.permissions.map((perm: any) => perm._id);

      const updatedSubAdmin = await SubAdmin.findByIdAndUpdate(
        subAdminId,
        {
          $addToSet: { 
            roles: roleId, 
            permissions: { $each: permissionIds }
          }
        },
        { new: true }
      ).populate("roles permissions").select("-password");

      return ResponseHandler.success(
        res, 
        updatedSubAdmin,
        "role assigned successfully"
      )
    } catch (error: any) {
      res.status(error.status || 500).json({
        message: error.message || "An error occurred while assigning role to subadmin",
      });
    }
  }
}

export default new RolesAndPermissionsController()