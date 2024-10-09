import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { UserController } from "../controllers/user.controller";
import { editUserProfileValidator } from "../validators/user.auth.validator";

const { editProfile } = new UserController();

const router = Router();

router.put(
  "/profile/edit",
  authenticate,
  authorize("user"),
  ...editUserProfileValidator,
  editProfile
);

export default router;
