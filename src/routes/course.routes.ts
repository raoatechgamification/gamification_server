import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";

import { CourseController } from "../controllers/course.controller";
import {
  createCourseValidator,
  courseContentValidator,
} from "../validators/course.validator";
import { upload } from "../utils/s3upload.utils";

const { createCourse, createCourseContent } = new CourseController();

const router = Router();

router.post(
  "/create",
  authenticate,
  authorize("admin"),
  ...createCourseValidator,
  createCourse
);

router.post(
  "/create/content/:courseId",
  authenticate,
  authorize("admin"),
  upload.array("file", 10),
  ...courseContentValidator,
  createCourseContent
);

export default router;
