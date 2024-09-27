import { Router } from "express";
import {
  registerUserValidator,
  loginUserValidator,
} from "../validators/user.auth.validator";

import { UserAuthController } from "../controllers/user.auth.controller";

const router = Router();

const { registerUser, loginUser } = UserAuthController;

router.post("/user/register", ...registerUserValidator, registerUser);

router.post("/user/login", ...loginUserValidator, loginUser);

export default router;
