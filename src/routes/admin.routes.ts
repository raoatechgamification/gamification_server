import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import AdminController from "../controllers/admin.controller";
import { adminEditUserProfileValidator } from "../validators/admin.validator";

const { viewAllUsers, editUserProfile } = AdminController;

const router = Router();

router.get("/view-all-users", authenticate, authorize("admin"), viewAllUsers);

router.put(
  "/user-details",
  authenticate,
  authorize("admin"),
  ...adminEditUserProfileValidator,
  editUserProfile
);

export default router;
