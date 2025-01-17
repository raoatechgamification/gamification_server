import { Router } from "express";
import { authenticate, authorize, checkSubadminPermission } from "../middlewares/auth.middleware";
import AdminController from "../controllers/admin.controller";

import { CourseController } from "../controllers/course.controller";
import {
  validateCreateCourse,
  courseContentValidator,
  createAnnouncementValidator,
  validateCourseId,
  createCourseValidator,
} from "../validators/course.validator";
import { upload, Optimizedupload } from "../utils/upload.utils";

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
  getPrograms,
  generalMarketPlace
} = new CourseController();

const { generateCourseReport } = AdminController;

const router = Router();

router.get(
  "/status",
  authenticate,
  authorize(["user", "admin", "subAdmin"]),
  checkSubadminPermission("Course Management", "Get User Programs"), 
  getPrograms
)

router.get(
  "/marketplace",
  authenticate,
  authorize(["user", "subAdmin", "admin", "superAdmin"]),
  checkSubadminPermission("Course Management", "Get Marketplace"), 
  generalMarketPlace
)

router.post(
  "/create",
  authenticate,
  authorize(["admin", "subAdmin"]),
  checkSubadminPermission("Course Management", "Create Course"),
  upload.array("file", 10),
  ...createCourseValidator,
  createCourse
);

router.post(
  "/add",
  authenticate,
  authorize(["admin", "subAdmin"]),
  checkSubadminPermission("Course Management", "Create Course"),
  upload.array("file", 10),
  ...validateCreateCourse,
  createACourse
);

router.post(
  "/:courseId/assign",
  authenticate,
  authorize(["admin", "subAdmin"]),
  checkSubadminPermission("Course Management", "Assign Course to User/Group"),
  ...validateCourseId,
  assignCourseToUsers
);

router.put(
  "/:courseId",
  authenticate,
  authorize(["admin", "subAdmin"]),
  checkSubadminPermission("Course Management", "Edit Course"),  
  ...validateCourseId,
  editCourse
);

router.get(
  "/all", 
  authenticate, 
  authorize(["user", "admin", "subAdmin", "superAdmin"]),
  checkSubadminPermission("Course Management", "View All Courses"),  getAllCourses
);

router.get("/allCourses", authenticate, getAllCoursesForUsers);
router.get("/:courseId", authenticate, getSingleCourse);

router.post(
  "/lesson",
  authenticate,
  authorize(["admin", "subAdmin"]),
  checkSubadminPermission("Course Management", "Create Lesson"),    
  Optimizedupload.array("file", 10),
  ...courseContentValidator,
  createLesson
);

router.get(
  "/lesson/getAll", 
  authenticate, 
  authorize(["user", "admin", "subAdmin", "superAdmin"]),
  checkSubadminPermission("Course Management", "View All Lessons"),     
  getAllLessons
);

router.get(
  "/curriculum/:courseId",
  authenticate,
  authorize(["user", "admin", "subAdmin", "superAdmin"]),
  checkSubadminPermission("Course Management", "View All Lessons"), 
  ...validateCourseId,
  getCourseLessons
);

router.post(
  "/announcement/:courseId",
  authenticate,
  authorize(["admin", "subAdmin"]),
  checkSubadminPermission("Announcement Management", "Create Announcement"), 
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
  authorize(["admin"]),
  generateCourseReport
);

router.patch(
  "/:courseId/move-to-ongoing",
  authenticate,
  authorize(["user"]),
  moveCourseToOngoingList
);

router.get(
  "/courses",
  authenticate,
  authorize(["user"]),
  enrolledCoursesWithProgress
);

router.get(
  "/:courseId/lessons",
  authenticate,
  authorize(["user"]),
  lessonsWithProgress
);

router.put(
  "/:courseId/lessons/:lessonId/completion",
  authenticate,
  authorize(["user"]),
  updateLessonCompletion
);

router.get(
  "/user/:courseId",
  authenticate,
  authorize(["user", "admin", "subAdmin", "superAdmin"]),
  checkSubadminPermission("Course Management", "View All Courses"),
  getCourseDetails
);

export default router;
