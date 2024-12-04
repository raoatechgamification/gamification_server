import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import AdminController from "../controllers/admin.controller";
import {
  adminEditUserProfileValidator,
  userIdValidator,
} from "../validators/admin.validator";

const { 
  viewAllUsers, 
  editUserProfile, 
  viewAUserProfile, 
} = AdminController;

const router = Router();

router.get("/users", authenticate, authorize("admin"), viewAllUsers);

router.put(
  "/user-details/:userId",
  authenticate,
  authorize("admin"),
  ...adminEditUserProfileValidator,
  editUserProfile
);

router.get(
  "/user-profile/:userId",
  authenticate,
  authorize("admin"),
  ...userIdValidator,
  viewAUserProfile
);


export default router;
