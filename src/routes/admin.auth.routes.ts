import { Router } from "express";

import {
  createOrganizationValidator,
  loginOrganizationValidator,
} from "../validators/organization.auth.validator";
import {
  registerUserValidator,
  loginUserValidator,
} from "../validators/user.auth.validator";
import { superAdminValidator } from "../validators/superadmin.validator";

import { AdminAuthController } from "../controllers/admin.auth.controller";
import { UserAuthController } from "../controllers/user.auth.controller";
import { SuperAdminController } from "../controllers/superadmin.auth.controller";

const { registerOrganization, loginOrganization } = AdminAuthController;
const { registerUser, loginUser } = UserAuthController;
const { registerSuperAdmin, loginSuperAdmin } = SuperAdminController;

const router = Router();

// Organization Auth
router.post(
  "/org/register",
  ...createOrganizationValidator,
  registerOrganization
);
router.post("/org/login", ...loginOrganizationValidator, loginOrganization);

// User Auth
router.post("/user/register", ...registerUserValidator, registerUser);
router.post("/user/login", ...loginUserValidator, loginUser);

// Super Admin Auth
router.post("/super-admin/signup", ...superAdminValidator, registerSuperAdmin);
router.post("/super-admin/login", ...superAdminValidator, loginSuperAdmin);

export default router;
