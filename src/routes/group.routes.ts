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
  getGroupById, 
  getAllGroups 
} = new GroupController();

const router = Router();

router.post(
  "/create", 
  authenticate, 
  authorize("admin"), 
  // ...validateCreateGroup,
  createGroup);

router.put(
  "/edit/:groupId", 
  authenticate, 
  authorize("admin"), 
  // ...validateEditGroup,
  editGroup
);

router.get(
  "/:groupId",
  authenticate,
  authorize("admin"),
  getGroupById
)

router.get(
  "/",
  authenticate,
  authorize("admin"),
  getAllGroups
)

export default router;
