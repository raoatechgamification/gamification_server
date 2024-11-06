import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import AdminController from "../controllers/admin.controller";

const { viewAllUsers, editUserProfile } = AdminController;

const router = Router();

router.get(
  "/view-all-users",
  authenticate,
  authorize('admin'),
  viewAllUsers
)

router.put(
  '/user-details',
  authenticate,
  authorize('admin'),
  editUserProfile
)


export default router;