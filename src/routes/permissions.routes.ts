import { Router } from "express";
import RolesAndPermissionsController from "../controllers/rolesAndPermissions.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const {
  getAllPermissions
} = RolesAndPermissionsController;

const router = Router();

router.get(
  "/",
  authenticate,
  authorize(["admin", "superAdmin", "subAdmin"]),
  getAllPermissions
)

export default router;