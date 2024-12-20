import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import AdminController from "../controllers/admin.controller";

import { CourseController } from "../controllers/course.controller";
import {
  validateCreateCourse,
  courseContentValidator,
  createAnnouncementValidator,
  validateCourseId,
  createCourseValidator,
} from "../validators/course.validator";
import { upload } from "../utils/upload.utils";

const {
  createCourse,
  createACourse,
  assignCourseToUsers,
  createLesson,
  getAllLessons,
  createAnnouncement,
  getAllCourses,
  getAllCoursesForUsers,
  getSingleCourse,
  getCourseLessons,
  getAllAnnouncementsByCourse,
  editCourse,
  enrolledCoursesWithProgress,
  lessonsWithProgress,
  moveCourseToOngoingList,
  updateLessonCompletion,
  getCourseCompletionLevel,
  getCourseDetails,
} = new CourseController();

const { generateCourseReport } = AdminController;

const router = Router();

router.post(
  "/create",
  authenticate,
  authorize("admin"),
  upload.array("file", 10),
  ...createCourseValidator,
  createCourse
);

router.post(
  "/add",
  authenticate,
  authorize("admin"),
  upload.array("file", 10),
  ...validateCreateCourse,
  createACourse
);

router.post(
  "/:courseId/assign",
  authenticate,
  authorize("admin"),
  ...validateCourseId,
  assignCourseToUsers
);

router.put(
  "/:courseId",
  authenticate,
  authorize("admin"),
  ...validateCourseId,
  editCourse
);

router.get("/all", authenticate, authorize("admin"), getAllCourses);

router.get("/allCourses", authenticate, getAllCoursesForUsers);
router.get("/:courseId", authenticate, getSingleCourse);

router.post(
  "/lesson",
  authenticate,
  authorize("admin"),
  upload.array("file", 10),
  ...courseContentValidator,
  createLesson
);

router.get("/lesson/getAll", authenticate, authorize("admin"), getAllLessons);

router.get(
  "/curriculum/:courseId",
  authenticate,
  ...validateCourseId,
  getCourseLessons
);

router.post(
  "/announcement/:courseId",
  authenticate,
  authorize("admin"),
  ...createAnnouncementValidator,
  createAnnouncement
);

router.get(
  "/announcement/:courseId",
  authenticate,
  ...validateCourseId,
  getAllAnnouncementsByCourse
);

router.get(
  "/:courseId/report",
  authenticate,
  authorize("admin"),
  generateCourseReport
);

router.patch(
  "/:courseId/move-to-ongoing",
  authenticate,
  authorize("user"),
  moveCourseToOngoingList
);

router.get(
  "/courses",
  authenticate,
  authorize("user"),
  enrolledCoursesWithProgress
);

router.get(
  "/:courseId/lessons",
  authenticate,
  authorize("user"),
  lessonsWithProgress
);

router.put(
  "/:courseId/lessons/:lessonId/completion",
  authenticate,
  authorize("user"),
  updateLessonCompletion
);

router.get(
  "/user/:courseId",
  authenticate,
  authorize("user"),
  getCourseDetails
);

export default router;
