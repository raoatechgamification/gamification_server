import { Router } from "express";
import AdminController from "../controllers/admin.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { upload } from "../utils/upload.utils";
import { userIdValidator } from "../validators/admin.validator";

const { viewAllUsers, editUserProfile, viewAUserProfile } = AdminController;

const router = Router();

router.get("/users", authenticate,   authorize(["admin"]), viewAllUsers);

router.put(
  "/user-details/:userId",
  authenticate,
  authorize(["admin"]),
  // ...adminEditUserProfileValidator,
  upload.single("image"),
  editUserProfile
);

router.get(
  "/user-profile/:userId",
  authenticate,
  authorize(["admin"]),
  ...userIdValidator,
  viewAUserProfile
);

export default router;
