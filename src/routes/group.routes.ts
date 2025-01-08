import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { GroupController } from "../controllers/group.controller";
import { 
  validateCreateGroup, 
  validateEditGroup 
} from "../validators/group.validator";

const { 
  createGroup, 
  editGroup,
} = new GroupController();

const router = Router();

router.post(
  "/create", 
  authenticate, 
  authorize("admin"), 
  createGroup);

router.put(
  "/edit/:groupId", 
  authenticate, 
  authorize("admin"), 
  editGroup
);

export default router;
