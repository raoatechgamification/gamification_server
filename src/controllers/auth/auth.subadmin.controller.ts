import dotenv from "dotenv";
import { Request, Response } from "express";
import User from "../../models/user.model";
import SubAdmin from "../../models/subadmin.model"
import Role from "../../models/subadmin.model";
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
        role,
        batch,
        password,
        sendEmail,
        contactPersonPlaceOfEmployment,
        nameOfContactPerson,
        contactEmail,
        contactPersonPhoneNumber,
      } = req.body;

      console.log(firstName, lastName, email)

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
      console.log(firstName, lastName, email)

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
      });

      console.log("The request got here")

      const response = await SubAdmin.findById(newSubAdmin._id).select(
        "-password "
      );

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

  async assignPermissionsToSubAdmin(req: Request, res: Response) {
  try {
    const { subAdminId, permissions } = req.body;

    if (!subAdminId || !permissions || !Array.isArray(permissions)) {
      return ResponseHandler.failure(
        res,
        "SubAdmin ID and permissions are required.",
        400
      );
    }

    // Validate if the permissions exist
    const validPermissions = await Permission.find({
      _id: { $in: permissions },
    });

      if (validPermissions.length !== permissions.length) {
        return ResponseHandler.failure(
          res,
          "Some permissions are invalid.",
          400
        );
      }

      // Update subAdmin's permissions
      const updatedSubAdmin = await SubAdmin.findByIdAndUpdate(
        subAdminId,
        { permissions: validPermissions.map((perm) => perm._id) },
        { new: true }
      ).populate("permissions").select(
        "-password"
      );;

      if (!updatedSubAdmin) {
        return ResponseHandler.failure(
          res,
          "SubAdmin not found.",
          404
        );
      }

      res.status(200).json({
        message: "Permissions successfully assigned.",
        subAdmin: updatedSubAdmin,
      });
    } catch (error: any) {
      res.status(error.status || 500).json({
        message: error.message || "An error occurred.",
      });
    }
  };

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