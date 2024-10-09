import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";

import { GroupController } from "../controllers/group.controller";

const { createGroup, editGroup } = new GroupController();
 
const router = Router();

router.post(
  "/create", 
  authenticate,
  authorize('admin'),
  createGroup
);

router.put(
  '/edit',
  authenticate,
  authorize('admin'),
  editGroup
)

export default router;
