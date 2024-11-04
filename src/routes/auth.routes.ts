import { Router } from "express";

import { authenticate, authorize } from "../middlewares/auth.middleware";

import { bulkUpload } from "../utils/upload.utils"

import {
  createOrganizationValidator,
  loginOrganizationValidator,
} from "../validators/organization.auth.validator";
import {
  registerUserValidator,
  loginUserValidator,
} from "../validators/user.auth.validator";
import { superAdminValidator } from "../validators/superadmin.validator";

import { AdminAuthController } from "../controllers/auth/auth.admin.controller";
import { UserAuthController } from "../controllers/auth/auth.user.controller";
import { SuperAdminAuthController } from "../controllers/auth/auth.superadmin.controller";

const { registerOrganization, loginOrganization } = AdminAuthController;
const { registerUser, bulkCreateUsers, createSingleUser, loginUser } = UserAuthController;
const { registerSuperAdmin, loginSuperAdmin } = SuperAdminAuthController;

const router = Router();

// Organization Auth
router.post(
  "/org/register",
  ...createOrganizationValidator,
  registerOrganization
);
router.post("/org/login", ...loginOrganizationValidator, loginOrganization);

// User Auth
router.post(
  "/user/register", 
  ...registerUserValidator, 
  registerUser
);

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
  createSingleUser
)

router.post("/user/login", ...loginUserValidator, loginUser);

// Super Admin Auth
router.post("/super-admin/signup", ...superAdminValidator, registerSuperAdmin);
router.post("/super-admin/login", ...superAdminValidator, loginSuperAdmin);

export default router;
