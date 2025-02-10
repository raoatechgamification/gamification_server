import { Router } from "express";
import AdminController from "../controllers/admin.controller";
import { SubAdminController } from "../controllers/auth/auth.subadmin.controller"
import { authenticate, authorize, checkSubadminPermission } from "../middlewares/auth.middleware";
import { upload } from "../utils/upload.utils";
import { userIdValidator } from "../validators/admin.validator";

const { 
  viewAllUsers, 
  editUserProfile, 
  viewAUserProfile, 
  updateGeneralLearnerTerm,
  updateGeneralLearnerGroupTerm, 
  updateGeneralSubLearnerGroupTerm, 
  updateGeneralInstructorTerm,
  archiveUser,
  enableUser,
  disableUser,
  archiveCourse,
  changeUserPassword
} = AdminController;

const { getAllSubAdmins, getASubAdmin } = new SubAdminController()

const router = Router();

router.get(
  "/subadmins",
  authenticate,
  authorize(["admin"]),
  getAllSubAdmins
)

router.get(
  "/subadmins/:id",
  authenticate,
  authorize(["admin"]),
  getASubAdmin
)

router.get(
  "/users", 
  authenticate,   
  authorize(["admin", "subAdmin"]), 
  checkSubadminPermission("User Management", "View All Users"),
  viewAllUsers
);

router.put(
  "/user-details/:userId",
  authenticate,
  authorize(["admin", "subAdmin"]),
  checkSubadminPermission("User Management", "Edit User"),
  // ...adminEditUserProfileValidator,
  upload.single("image"),
  editUserProfile
);

router.get(
  "/user-profile/:userId",
  authenticate,
  authorize(["admin", "subAdmin"]),
  checkSubadminPermission("User Management", "Access a User"),
  ...userIdValidator,
  viewAUserProfile
);

router.put(
  "/general-learner-term",
  authenticate,
  authorize(["admin"]),
  updateGeneralLearnerTerm
)

router.put(
  "/general-learner-group-term",
  authenticate,
  authorize(["admin"]),
  updateGeneralLearnerGroupTerm
)

router.put(
  "/general-sublearner-group-term",
  authenticate,
  authorize(["admin"]),
  updateGeneralSubLearnerGroupTerm
)

router.put(
  "/general-instructor-term",
  authenticate,
  authorize(["admin"]),
  updateGeneralInstructorTerm
)

router.patch(
  "/users/:userId/disable", 
  authenticate,
  authorize(["admin", "subAdmin"]),
  checkSubadminPermission("User Management", "Disable User"),
  disableUser
);

router.patch(
  "/users/:userId/archive", 
  authenticate,
  authorize(["admin", "subAdmin"]),
  checkSubadminPermission("User Management", "Archive User"),
  archiveUser
);

router.patch(
  "/users/:userId/enable", 
  authenticate,
  authorize(["admin", "subAdmin"]),
  checkSubadminPermission("User Management", "Enable User"),
  enableUser
);

router.patch(
  "/courses/:courseId/archive",
  authenticate,
  authorize(["admin", "subAdmin"]),
  checkSubadminPermission("Course Management", "Archive Course"),
  archiveCourse
)

router.put(
  "/users/change-password",
  authenticate,
  authorize(["admin"]),
  changeUserPassword
)


export default router;
