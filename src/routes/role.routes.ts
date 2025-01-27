import { Router } from "express";
import RolesAndPermissionsController from "../controllers/rolesAndPermissions.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const {
  createRole
} = RolesAndPermissionsController;

const router = Router();

router.post(
  "/",
  authenticate,
  authorize(["admin"]),
  createRole
)

export default router;