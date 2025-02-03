import { Request, Response } from "express";
import mongoose from "mongoose";
import User from "../../models/user.model";
import SubAdmin from "../../models/subadmin.model";
import Role from "../../models/role.model";
import SuperAdmin, { ISuperAdmin } from "../../models/superadmin.model";
import Organization, { IOrganization } from "../../models/organization.model";
import Permission from "../../models/permission.model";
import { ResponseHandler } from "../../middlewares/responseHandler.middleware"; 
import { uploadToCloudinary } from "../../utils/cloudinaryUpload"
import { comparePassword, hashPassword } from "../../utils/hash";
import { generateToken } from "../../utils/jwt";
import { getOrganizationId } from "../../utils/getOrganizationId.util";


export class SubAdminController {
  async createSubAdminAccount(req: Request, res: Response) {
    try {
      let {
        firstName,
        lastName,
        otherName,
        email,
        phone,
        userId,
        gender,
        dateOfBirth,
        country,
        address,
        city,
        LGA,
        state,
        officeAddress,
        officeCity,
        officeLGA,
        officeState,
        employerName,
        roleId, // Role ID passed in the request body
        batch,
        password,
        sendEmail,
        contactPersonPlaceOfEmployment,
        nameOfContactPerson,
        contactEmail,
        contactPersonPhoneNumber,
      } = req.body;

      console.log(firstName, lastName, email);

      const image = req.file;
      const organizationId = req.admin._id;

      let fileUploadResult: any = null;
      if (image) {
        fileUploadResult = await uploadToCloudinary(
          image.buffer,
          image.mimetype,
          "userDisplayPictures"
        );
      }

      if (!password) {
        password = `${firstName}${lastName}123#`;
      }

      const organization = await Organization.findById(organizationId);
      if (!organization) {
        return ResponseHandler.failure(res, "Organization not found", 400);
      }

      const existingAccount =
        (await Organization.findOne({ email })) ||
        (await User.findOne({ email })) ||
        (await SuperAdmin.findOne({ email })) ||
        (await SubAdmin.findOne({ email }));

      if (existingAccount) {
        return ResponseHandler.failure(res, "Email already registered", 400);
      }

      const hashedPassword = await hashPassword(password);
      console.log(firstName, lastName, email);

      // **Find Role and Permissions**
      let role = null;
      let permissionIds: mongoose.Types.ObjectId[] = [];
      if (roleId) {
        role = await Role.findOne({
          _id: roleId,
          organizationId
        }).populate("permissions");

        if (!role) {
          return ResponseHandler.failure(res, "Role not found", 400);
        }

        permissionIds = role.permissions.map((perm: any) => perm._id);
      }

      // **Create SubAdmin with Role and Permissions**
      const newSubAdmin = await SubAdmin.create({
        firstName,
        lastName,
        otherName,
        email,
        phone,
        userId,
        gender,
        dateOfBirth,
        image: fileUploadResult ? fileUploadResult.secure_url : null,
        country,
        address,
        city,
        LGA,
        state,
        officeAddress,
        officeCity,
        officeLGA,
        employerName,
        officeState,
        password: hashedPassword,
        organizationId,
        batch,
        contactPersonPlaceOfEmployment,
        contactEmail,
        nameOfContactPerson,
        contactPersonPhoneNumber,
        userType: "subAdmin",
        roles: roleId ? [roleId] : [], // Assign role if provided
        permissions: permissionIds // Assign permissions if a role is provided
      });

      console.log("The request got here");

      const response = await SubAdmin.findById(newSubAdmin._id)
        .populate("roles permissions")
        .select("-password");

      return res.status(201).json({
        message: "Sub-admin account created successfully",
        data: response,
        loginUrl: `${process.env.FRONTENT_BASEURL}/auth/subadmin/login`,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "An error occurred while creating sub-admin account",
        error: error.message,
      });
    }
  }

  // async createSubAdminAccount(req: Request, res: Response) {
  //   try {
  //     let {
  //       firstName,
  //       lastName,
  //       otherName,
  //       email,
  //       phone,
  //       userId,
  //       gender,
  //       dateOfBirth,
  //       country,
  //       address,
  //       city,
  //       LGA,
  //       state,
  //       officeAddress,
  //       officeCity,
  //       officeLGA,
  //       officeState,
  //       employerName,
  //       role,
  //       batch,
  //       password,
  //       sendEmail,
  //       contactPersonPlaceOfEmployment,
  //       nameOfContactPerson,
  //       contactEmail,
  //       contactPersonPhoneNumber,
  //     } = req.body;

  //     console.log(firstName, lastName, email)

  //     const image = req.file;
  //     const organizationId = req.admin._id;

  //     let fileUploadResult: any = null;
  //     if (image) {
  //       fileUploadResult = await uploadToCloudinary(
  //         image.buffer,
  //         image.mimetype,
  //         "userDisplayPictures"
  //       );
  //     }

  //     if (!password) {
  //       password = `${firstName}${lastName}123#`;
  //     }

  //     const organization = await Organization.findById(organizationId);
  //     if (!organization) {
  //       return ResponseHandler.failure(res, "Organization not found", 400);
  //     }

  //     const existingAccount =
  //       (await Organization.findOne({ email })) ||
  //       (await User.findOne({ email })) ||
  //       (await SuperAdmin.findOne({ email })) ||
  //       (await SubAdmin.findOne({ email }));

  //     if (existingAccount) {
  //       return ResponseHandler.failure(res, "Email already registered", 400);
  //     }

  //     const hashedPassword = await hashPassword(password);
  //     console.log(firstName, lastName, email)

  //     const newSubAdmin = await SubAdmin.create({
  //       firstName,
  //       lastName,
  //       otherName,
  //       email,
  //       phone,
  //       userId,
  //       gender,
  //       dateOfBirth,
  //       image: fileUploadResult ? fileUploadResult.secure_url : null,
  //       country,
  //       address,
  //       city,
  //       LGA,
  //       state,
  //       officeAddress,
  //       officeCity,
  //       officeLGA,
  //       employerName,
  //       officeState,
  //       password: hashedPassword,
  //       organizationId,
  //       batch,
  //       contactPersonPlaceOfEmployment,
  //       contactEmail,
  //       nameOfContactPerson,
  //       contactPersonPhoneNumber,
  //       userType: "subAdmin",
  //     });

  //     console.log("The request got here")

  //     const response = await SubAdmin.findById(newSubAdmin._id).select(
  //       "-password "
  //     );

  //     return res.status(201).json({
  //       message: "Sub-admin account created successfully",
  //       data: response,
  //       loginUrl: `${process.env.FRONTENT_BASEURL}/auth/subadmin/login`,
  //     });
  //   } catch (error: any) {
  //     return res.status(500).json({
  //       success: false,
  //       message: "An error occurred while creating sub-admin account",
  //       error: error.message,
  //     });
  //   }
  // }

  async editSubAdminAccount(req: Request, res: Response) {
    try {
      const { subAdminId } = req.params;
      const {
        firstName,
        lastName,
        otherName,
        phone,
        gender,
        dateOfBirth,
        country,
        address,
        city,
        LGA,
        state,
        officeAddress,
        officeCity,
        officeLGA,
        officeState,
        employerName,
        roleId, // Optional role update
        batch,
        contactPersonPlaceOfEmployment,
        nameOfContactPerson,
        contactEmail,
        contactPersonPhoneNumber,
      } = req.body;

      const image = req.file;
      const organizationId = req.admin._id;

      // Find the sub-admin
      const subAdmin = await SubAdmin.findOne({ _id: subAdminId, organizationId });
      if (!subAdmin) {
        return ResponseHandler.failure(res, "SubAdmin not found", 404);
      }

      // Handle image upload if a new image is provided
      let fileUploadResult: any = null;
      if (image) {
        fileUploadResult = await uploadToCloudinary(image.buffer, image.mimetype, "userDisplayPictures");
      }

      // Update sub-admin details
      const updateData: any = {
        firstName,
        lastName,
        otherName,
        phone,
        gender,
        dateOfBirth,
        country,
        address,
        city,
        LGA,
        state,
        officeAddress,
        officeCity,
        officeLGA,
        officeState,
        employerName,
        batch,
        contactPersonPlaceOfEmployment,
        nameOfContactPerson,
        contactEmail,
        contactPersonPhoneNumber,
      };

      if (fileUploadResult) {
        updateData.image = fileUploadResult.secure_url;
      }

      // If roleId is provided, update roles and permissions
      if (roleId) {
        const role = await Role.findOne({ _id: roleId, organizationId }).populate("permissions");
        if (!role) {
          return ResponseHandler.failure(res, "Role not found", 400);
        }

        const permissionIds = role.permissions.map((perm: any) => perm._id);
        updateData.roles = [roleId];
        updateData.permissions = permissionIds;
      }

      // Update the sub-admin
      const updatedSubAdmin = await SubAdmin.findByIdAndUpdate(subAdminId, updateData, {
        new: true,
      })
      .populate("roles permissions")
      .select("-password");

      return ResponseHandler.success(res, updatedSubAdmin, "SubAdmin account updated successfully");
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "An error occurred while updating sub-admin account",
        error: error.message,
      });
    }
  }

  async loginSubAdmin(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const registeredUser = await SubAdmin.findOne({ email });

      if (!registeredUser) {
        return ResponseHandler.failure(res, "Sub-admin does not exist", 400);
      }

      const checkPassword = await comparePassword(
        password,
        registeredUser.password
      );

      if (!checkPassword) {
        return ResponseHandler.failure(
          res,
          "You have entered an incorrect password",
          400
        );
      }

      const payload = {
        id: registeredUser._id,
        email: registeredUser.email,
        username: registeredUser.username,
        phone: registeredUser.phone,
        organizationId: registeredUser.organizationId,
        firstName: registeredUser.firstName,
        lastName: registeredUser.lastName,
        role: registeredUser.role,
        permissions: registeredUser.permissions
      };

      const token = await generateToken(payload);

      const response = await SubAdmin.findById(registeredUser._id).select(
        "-password"
      );

      return ResponseHandler.loginResponse(
        res,
        token,
        response,
        "Login Successful"
      );
    } catch (error: any) {
      res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  }

  // async assignPermissionsToSubAdmin(req: Request, res: Response) {
  // try {
  //   const { subAdminId, permissions } = req.body;

  //   if (!subAdminId || !permissions || !Array.isArray(permissions)) {
  //     return ResponseHandler.failure(
  //       res,
  //       "SubAdmin ID and permissions are required.",
  //       400
  //     );
  //   }

  //   // Validate if the permissions exist
  //   const validPermissions = await Permission.find({
  //     _id: { $in: permissions },
  //   });

  //     if (validPermissions.length !== permissions.length) {
  //       return ResponseHandler.failure(
  //         res,
  //         "Some permissions are invalid.",
  //         400
  //       );
  //     }

  //     // Update subAdmin's permissions
  //     const updatedSubAdmin = await SubAdmin.findByIdAndUpdate(
  //       subAdminId,
  //       { permissions: validPermissions.map((perm) => perm._id) },
  //       { new: true }
  //     ).populate("permissions").select(
  //       "-password"
  //     );;

  //     if (!updatedSubAdmin) {
  //       return ResponseHandler.failure(
  //         res,
  //         "SubAdmin not found.",
  //         404
  //       );
  //     }

  //     res.status(200).json({
  //       message: "Permissions successfully assigned.",
  //       subAdmin: updatedSubAdmin,
  //     });
  //   } catch (error: any) {
  //     res.status(error.status || 500).json({
  //       message: error.message || "An error occurred.",
  //     });
  //   }
  // };

  async getAllSubadmins(req: Request, res: Response) {
    try {
      let organizationId = await getOrganizationId(req, res);
      if (!organizationId) {
        return;
      }

      const organization = await Organization.findById(organizationId)
      if (!organization) {
        return ResponseHandler.failure(res, "Organization not found", 400);
      }

      const subadmins = await SubAdmin.find({ organizationId }).select("-password")

      if (!subadmins || subadmins.length === 0) {
        return ResponseHandler.failure(res, "No subadmin found.")
      }

      ResponseHandler.success(res, subadmins, "Subadmins fetched successfully")
    } catch (error: any) {
      console.error("Error fetching subadmins:", error);
      return ResponseHandler.failure(
        res,
        error.message || "An error occurred while fetching subadmins.",
        error.status || 500
      );
    }
  }
}