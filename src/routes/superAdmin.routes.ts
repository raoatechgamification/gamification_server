import { Router } from "express";
import { authenticate, authorize } from '../middlewares/auth.middleware';

import { SuperAdminController } from "../controllers/superadmin.controller";

const { viewOrganizations, viewUsers } = SuperAdminController;

const router = Router();

router.get(
  "/organizations/view-all", 
  authenticate,
  authorize('superAdmin'),
  viewOrganizations
);

router.get(
  "/users/view-all",
  authenticate,
  authorize('superAdmin'),
  viewUsers
)

export default router;