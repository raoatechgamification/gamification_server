import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";

import { CourseController } from "../controllers/course.controller";
import { createCourseValidator } from "../validators/course.validator";

const { createCourse } = new CourseController();

const router = Router();

router.post("/create", ...createCourseValidator, createCourse);

export default router;
