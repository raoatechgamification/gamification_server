import { Router } from "express";
import RolesAndPermissionsController from "../controllers/rolesAndPermissions.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const {
  createRole,
  getAllRoles,
  getRole
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

router.get(
  "/:id",
  authenticate,
  authorize(["admin"]),
  getRole
)

export default router;