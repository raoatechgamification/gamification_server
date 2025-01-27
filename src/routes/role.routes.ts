import { Router } from "express";
import RolesAndPermissionsController from "../controllers/rolesAndPermissions.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const {
  createRole,
  getAllRoles
} = RolesAndPermissionsController;

const router = Router();

router.post(
  "/",
  authenticate,
  authorize(["admin"]),
  createRole
)

router.get(
  "/",
  authenticate,
  authorize(["admin"]),
  getAllRoles
)

export default router;