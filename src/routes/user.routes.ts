import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import {
  changePasswordValidator,
  editUserProfileValidator,
  userIdValidator,
} from "../validators/user.auth.validator";

const {
  editProfile,
  billHistory,
  dueBills,
  viewBill,
  updatePassword,
  getAUserProfileForUser,
  getAllUserCertificates,
} = new UserController();

const router = Router();

router.get(
  "/get-user/:organisationID",
  authenticate,
  authorize("user"),
  ...userIdValidator,
  getAUserProfileForUser
);
router.put(
  "/profile/edit",
  authenticate,
  authorize("user"),
  ...editUserProfileValidator,
  editProfile
);

router.get("/payment-history", authenticate, authorize("user"), billHistory);

router.get("/due-bills", authenticate, authorize("user"), dueBills);

router.get("/bills", authenticate, authorize("user"));

router.get("/view-bill/:paymentId", authenticate, authorize("user"), viewBill);

router.put(
  "/change-password",
  authenticate,
  authorize("user"),
  ...changePasswordValidator,
  updatePassword
);

router.get(
  "/certificates",
  authenticate,
  authorize("user"),
  ...userIdValidator,
  getAllUserCertificates
);

// router.get(
//   "/courses/:courseId/progress",
//   authenticate,
//   authorize("user"),
//   courseAndLessonProgress
// )

export default router;
