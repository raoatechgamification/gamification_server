import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";

import { CourseController } from "../controllers/course.controller";
import {
  createCourseValidator,
  courseContentValidator,
  createAnnouncementValidator,
  getCourseCurriculumValidator,
} from "../validators/course.validator";
import { upload } from "../utils/upload.utils";

const {
  createCourse,
  createCourseContent,
  createAnnouncement,
  getCourseCurriculum,
  getAllAnnouncementsByCourse,
} = new CourseController();

const router = Router();

router.post(
  "/create",
  authenticate,
  authorize("admin"),
  ...createCourseValidator,
  createCourse
);

router.post(
  "/curriculum/:courseId",
  authenticate,
  authorize("admin"),
  upload.array("file", 10),
  ...courseContentValidator,
  createCourseContent
);

router.get(
  "/curriculum/:courseId",
  authenticate,
  ...getCourseCurriculumValidator,
  getCourseCurriculum
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
  ...getCourseCurriculumValidator,
  getAllAnnouncementsByCourse
);

export default router;
