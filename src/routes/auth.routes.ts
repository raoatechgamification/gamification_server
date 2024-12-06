import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { bulkUpload } from "../utils/upload.utils";
import {
  createOrganizationValidator,
  loginValidator,
} from "../validators/organization.auth.validator";
import {
  registerUserValidator,
  loginUserValidator,
} from "../validators/user.auth.validator";

import { superAdminValidator } from "../validators/superadmin.validator";

import { AdminAuthController } from "../controllers/auth/auth.admin.controller";
import { UserAuthController } from "../controllers/auth/auth.user.controller";
import { SuperAdminAuthController } from "../controllers/auth/auth.superadmin.controller";

import { upload } from "../utils/upload.utils";

const { registerOrganization, loginOrganization } = AdminAuthController;
const { registerUser, bulkCreateUsers, createSingleUser, login } =
  UserAuthController;
const { registerSuperAdmin, loginSuperAdmin } = SuperAdminAuthController;

const router = Router();

router.post("/login", ...loginValidator, login);

// Organization Auth
router.post(
  "/org/register",
  ...createOrganizationValidator,
  registerOrganization
);

// User Auth
router.post(
  "/bulk-create",
  authenticate,
  authorize("admin"),
  bulkUpload.single("file"),
  bulkCreateUsers
);

router.post(
  "/single-create",
  authenticate,
  authorize("admin"),
  upload.single("image"),
  createSingleUser
);

// Super Admin Auth
router.post("/super-admin/signup", ...superAdminValidator, registerSuperAdmin);

export default router;
