import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { UserController } from "../controllers/user.controller";
import { editUserProfileValidator, changePasswordValidator } from "../validators/user.auth.validator";

const { 
  editProfile, 
  billHistory, 
  dueBills, 
  viewBill, 
  updatePassword, 
  userPrograms,
  enrolledCoursesWithProgress,
  lessonsWithProgress,
  markLessonAsComplete,
} =
  new UserController();

const router = Router();

router.put(
  "/profile/edit",
  authenticate,
  authorize("user"),
  ...editUserProfileValidator,
  editProfile
);

router.get("/bill-history", authenticate, authorize("user"), billHistory);

router.get("/due-bills", authenticate, authorize("user"), dueBills);

router.get("/view-bill/:paymentId", authenticate, authorize("user"), viewBill);

router.put(
  "/change-password", 
  authenticate, 
  authorize("user"), 
  ...changePasswordValidator,
  updatePassword
);

router.get(
  "/programs",
  authenticate,
  authorize("user"),
  userPrograms
)

router.get(
  '/courses',
  authenticate,
  authorize('user'),
  enrolledCoursesWithProgress
)

router.get(
  "/courses/:courseId/lessons",
  authenticate,
  authorize("user"),
  lessonsWithProgress
)

router.put(
  "/:courseId/lessons/:lessonId/complete",
  authenticate,
  authorize("user"),
  markLessonAsComplete
)

// router.get(
//   "/courses/:courseId/progress",
//   authenticate,
//   authorize("user"),
//   courseAndLessonProgress
// )

export default router;
