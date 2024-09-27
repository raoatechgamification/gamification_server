import { Router } from "express";
import {
  createOrganizationValidator,
  loginOrganizationValidator,
} from "../validators/organization.auth.validator";

import { AdminAuthController } from "../controllers/admin.auth.controller";

const { registerOrganization, loginOrganization } = AdminAuthController;

const router = Router();

router.post("/org/register", ...createOrganizationValidator, registerOrganization);

router.post("/org/login", ...loginOrganizationValidator, loginOrganization);

export default router;
