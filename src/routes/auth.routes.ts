import { Router } from "express";
import {
  createOrganizationValidator,
  loginOrganizationValidator,
} from "../validators/organization.validator";

import { AuthController } from "../controllers/auth.controller";

const { registerOrganization, loginOrganization } = AuthController;

const router = Router();

router.post("/register", ...createOrganizationValidator, registerOrganization);

router.post("/login", ...loginOrganizationValidator, loginOrganization);

export default router;
