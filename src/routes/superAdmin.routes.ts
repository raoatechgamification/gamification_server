import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";

import { SuperAdminController } from "../controllers/superadmin.controller";

import {
  userIdValidator,
  organizationIdValidator,
  updateUserValidator,
  updateOrganizationValidator,
  validateOrganizationExportData,
  validateUserExportData,
} from "../validators/superadmin.validator";

const {
  viewOrganizations,
  viewUsers,
  viewAUser,
  viewAnOrganization,
  updateAUser,
  updateAnOrganization,
  deleteAUser,
  deleteAnOrganization,
  exportDataAsCsvFile,
  exportDataAsExcelFile,
} = SuperAdminController;

const router = Router();

router.get(
  "/organizations/view-all",
  authenticate,
  authorize("superAdmin"),
  viewOrganizations
);

router.get("/users/view-all", authenticate, authorize("superAdmin"), viewUsers);

router.get(
  "/users/:userId",
  authenticate,
  authorize("superAdmin"),
  ...userIdValidator,
  viewAUser
);

router.get(
  "/organizations/:organizationId",
  authenticate,
  authorize("superAdmin"),
  ...organizationIdValidator,
  viewAnOrganization
);

router.put(
  "/users/:userId",
  authenticate,
  authorize("superAdmin"),
  ...updateUserValidator,
  updateAUser
);

router.put(
  "/organizations/:organizationId",
  authenticate,
  authorize("superAdmin"),
  ...updateOrganizationValidator,
  updateAnOrganization
);

router.delete(
  "/users/:userId",
  authenticate,
  authorize("superAdmin"),
  ...userIdValidator,
  deleteAUser
);

router.delete(
  "/organizations/:organizationId",
  authenticate,
  authorize("superAdmin"),
  ...organizationIdValidator,
  deleteAnOrganization
);

router.get(
  "/organizations/export/csv",
  authenticate,
  authorize("superAdmin"),
  ...validateOrganizationExportData,
  exportDataAsCsvFile
);

router.get(
  "/organizations/export/excel",
  authenticate,
  authorize("superAdmin"),
  ...validateOrganizationExportData,
  exportDataAsExcelFile
);

router.get(
  "/users/export/csv",
  authenticate,
  authorize("superAdmin"),
  ...validateUserExportData,
  exportDataAsCsvFile
);

router.get(
  "/users/export/excel",
  authenticate,
  authorize("superAdmin"),
  ...validateUserExportData,
  exportDataAsExcelFile
);

export default router;
