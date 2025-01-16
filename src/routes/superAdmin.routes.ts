import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";

import { SuperAdminController } from "../controllers/superadmin.controller";

import {
  userIdValidator,
  organizationIdValidator,
  updateUserValidator,
  updateOrganizationValidator,
} from "../validators/superadmin.validator";

const {
  viewOrganizations,
  viewUsers,
  viewAUser,
  viewAnOrganization,
  updateAUser,
  updateAnOrganization,
  exportUserDataAsCsvFile,
  exportUserDataAsExcelFile,
  exportOrganizationDataAsCsvFile,
  exportOrganizationDataAsExcelFile,
} = SuperAdminController;

const router = Router();

router.get(
  "/organizations/view-all",
  authenticate,
  authorize(["superAdmin"]),
  viewOrganizations
);

router.get("/users/view-all", authenticate, authorize(["superAdmin"]), viewUsers);

router.get(
  "/users/:userId",
  authenticate,
  authorize(["superAdmin"]),
  ...userIdValidator,
  viewAUser
);

router.get(
  "/organizations/:organizationId",
  authenticate,
  authorize(["superAdmin"]),
  ...organizationIdValidator,
  viewAnOrganization
);

router.put(
  "/users/:userId",
  authenticate,
  authorize(["superAdmin"]),
  ...updateUserValidator,
  updateAUser
);

router.put(
  "/organizations/:organizationId",
  authenticate,
  authorize(["superAdmin"]),
  ...updateOrganizationValidator,
  updateAnOrganization
);

router.post(
  "/organizations/export/csv",
  authenticate,
  authorize(["superAdmin"]),
  exportOrganizationDataAsCsvFile
);

router.post(
  "/organizations/export/excel",
  authenticate,
  authorize(["superAdmin"]),
  exportOrganizationDataAsExcelFile
);

router.post(
  "/users/export/csv",
  authenticate,
  authorize(["superAdmin"]),
  exportUserDataAsCsvFile
);

router.post(
  "/users/export/excel",
  authenticate,
  authorize(["superAdmin"]),
  exportUserDataAsExcelFile
);

export default router;
