import SubAdmin from "../models/subadmin.model";
import { Response } from "express";
import { ResponseHandler } from "../middlewares/responseHandler.middleware"
import mongoose from "mongoose";

export const getOrganizationId = async (
  req: any,
  res: Response
): Promise<mongoose.Schema.Types.ObjectId | null> => {
  if (req.admin) {
    return req.admin._id;
  } else if (req.user && req.user.role === "subAdmin") {
    const subAdmin = await SubAdmin.findById(req.user.id);
    if (!subAdmin) {
      ResponseHandler.failure(res, "Subadmin not found", 404);
      return null; // Stop further execution in case of an error
    }
    return subAdmin.organizationId;
  } else {
    ResponseHandler.failure(res, "Unauthorized access", 403);
    return null; // Stop further execution in case of an error
  }
};
