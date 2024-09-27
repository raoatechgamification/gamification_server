import { Router } from "express";
import {
  createOrganizationValidator,
  loginOrganizationValidator,
} from "../validators/organization.validator";

import { AdminAuthController } from "../controllers/admin.auth.controller";

const { registerOrganization, loginOrganization } = AdminAuthController;

const router = Router();

router.post("/register", ...createOrganizationValidator, registerOrganization);

router.post("/login", ...loginOrganizationValidator, loginOrganization);

export default router;
