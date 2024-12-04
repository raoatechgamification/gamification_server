import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";

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
  createAnnouncement,
  getAllCourses,
  getCourseLessons,
  getAllAnnouncementsByCourse,
} = new CourseController();


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
  ...validateCreateCourse,
  createACourse
)

router.post(
  "/:courseId/assign",
  authenticate,
  authorize("admin"),
  ...validateCourseId,
  assignCourseToUsers
)

router.get(
  "/all",
  authenticate,
  authorize("admin"),
  getAllCourses
);

router.post(
  "/lesson",
  authenticate,
  authorize("admin"),
  upload.array("file", 10),
  ...courseContentValidator,
  createLesson
);

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

export default router;
