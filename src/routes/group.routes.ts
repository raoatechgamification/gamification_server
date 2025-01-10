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
  getAllGroups,
  assignUsersToGroup,
  assignCourseToGroup 
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

router.post(
  "/assign-users",
  authenticate,
  authorize("admin"),
  assignUsersToGroup
)

router.post(
  "/assign-course/:courseId",
  authenticate,
  authorize("admin"),
  assignCourseToGroup
)

export default router;
