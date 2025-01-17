import { Router } from "express";
import AdminController from "../controllers/admin.controller";
import { authenticate, authorize, checkSubadminPermission } from "../middlewares/auth.middleware";
import { upload } from "../utils/upload.utils";
import { userIdValidator } from "../validators/admin.validator";

const { viewAllUsers, editUserProfile, viewAUserProfile } = AdminController;

const router = Router();

router.get(
  "/users", 
  authenticate,   
  authorize(["admin", "subAdmin"]), 
  checkSubadminPermission("User Management", "View All Users"),
  viewAllUsers
);

router.put(
  "/user-details/:userId",
  authenticate,
  authorize(["admin", "subAdmin"]),
  checkSubadminPermission("User Management", "Edit User"),
  // ...adminEditUserProfileValidator,
  upload.single("image"),
  editUserProfile
);

router.get(
  "/user-profile/:userId",
  authenticate,
  authorize(["admin", "subAdmin"]),
  checkSubadminPermission("User Management", "Access a User"),
  ...userIdValidator,
  viewAUserProfile
);

export default router;
