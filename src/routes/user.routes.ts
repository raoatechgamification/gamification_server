import { Router } from "express";
import { authenticate, authorize, checkSubadminPermission } from "../middlewares/auth.middleware";
import { UserController } from "../controllers/user.controller";
import { editUserProfileValidator, changePasswordValidator } from "../validators/user.auth.validator";
import { userIdValidator } from "../validators/user.auth.validator";

const { 
  editProfile, 
  billHistory, 
  dueBills, 
  viewBill, 
  updatePassword, 
  getAllUserCertificates,
} =
  new UserController();

const router = Router();

router.put(
  "/profile/edit",
  authenticate,
  authorize(["user", "subAdmin"]),
  checkSubadminPermission("User Management", "Edit User"), 
  ...editUserProfileValidator,
  editProfile
);

router.get("/payment-history", authenticate, authorize(["user"]), billHistory);

router.get("/due-bills", authenticate, authorize(["user"]), dueBills);

router.get("/bills", authenticate, 
  authorize(["user"]))

router.get("/view-bill/:paymentId", authenticate, authorize(["user"]), viewBill);

router.put(
  "/change-password", 
  authenticate, 
  authorize(["user"]), 
  ...changePasswordValidator,
  updatePassword
);

router.get(
  "/certificates",
  authenticate,
  authorize(["user"]),
  ...userIdValidator,
  getAllUserCertificates
)

// router.get(
//   "/courses/:courseId/progress",
//   authenticate,
//   authorize(["user"]),
//   courseAndLessonProgress
// )

export default router;
