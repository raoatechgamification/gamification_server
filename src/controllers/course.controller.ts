import mongoose from "mongoose";
import { Request, Response, NextFunction } from "express";
import { ResponseHandler } from "../middlewares/responseHandler.middleware";
import Course from "../models/course.model";
import Lesson from "../models/lesson.model";
import Announcement from "../models/announcement.model";
import Assessment from "../models/assessment.model";
import { NotificationController } from "../controllers/notification.controller";
import { uploadToCloudinary } from "../utils/cloudinaryUpload";

const { createNotification } = new NotificationController();

export class CourseController {
  async createCourse(req: Request, res: Response) {
    try {
      const organizationId = req.admin._id;

      const files = req.files as Express.Multer.File[];
      const {
        duration,
        landingPageTitle,
        serviceTitleDescription,
        servicePicture,
        serviceType,
        serviceItem,
        serviceItemDescription,
        courseCode,
        courseLevel,
        startDate,
        endDate,
        numberOfHoursPerDay,
        numberOfDaysPerWeek,
        cost,
        promo,
        promoCode,
        promoValue,
        platformCharge,
        actualCost,
        sharing,
        sharingValue,
        visibilityStartDate,
        visibilityEndDate,
        visibilityStartTime,
        visibilityEndTime,
        curriculum,
        teachingMethod,
      } = req.body;

      let Urls: string[] = [];

      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const uploadResult = await uploadToCloudinary(
            file.buffer,
            file.mimetype,
            "course-content"
          );
          if (uploadResult && uploadResult.secure_url) {
            Urls.push(uploadResult.secure_url);
          }
        }
      }

      const course = await Course.create({
        duration,
        organizationId,
        landingPageTitle,
        serviceTitleDescription,
        servicePicture: Urls[0],
        serviceType,
        serviceItem,
        serviceItemDescription,
        courseCode,
        courseLevel,
        startDate,
        endDate,
        numberOfHoursPerDay,
        numberOfDaysPerWeek,
        cost,
        promo,
        promoCode,
        promoValue,
        platformCharge,
        actualCost,
        sharing,
        sharingValue,
        visibilityStartDate,
        visibilityEndDate,
        visibilityStartTime,
        visibilityEndTime,
        curriculum: Urls[1],
        teachingMethod,
      });

      return ResponseHandler.success(
        res,
        course,
        "Course created successfully",
        201
      );
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        `Server error: ${error.message}`,
        500
      );
    }
  }

  async getAllCourses(req: Request, res: Response) {
    try {
      const organizationId = req.admin._id;

      const courses = await Course.find({ organizationId });

      if (!courses) {
        return ResponseHandler.success(
          res,
          "You have no courses yet, start by creating a course!"
        );
      }

      return ResponseHandler.success(
        res,
        courses,
        "Courses retrieved successfully",
        200
      );
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        `Server error: ${error.message}`,
        500
      );
    }
  }

  async createLesson(req: Request, res: Response, next: NextFunction) {
    try {
      const instructorId = req.admin._id;
      // const { courseId } = req.params;
      const { title, objectives, link } = req.body;

      const files = req.files as Express.Multer.File[];

      // const course = await Course.findById(courseId);
      // if (
      //   !course ||
      //   !new mongoose.Types.ObjectId(course.instructorId).equals(instructorId)
      // ) {
      //   return ResponseHandler.failure(
      //     res,
      //     "You are not authorized to add contents to this course",
      //     403
      //   );
      // }

      let Urls: string[] = [];

      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];

          if (file.size > 5 * 1024 * 1024 * 1024) {
            return ResponseHandler.failure(res, "File exceeds maximum size of 5GB", 400);
          }
          
          const uploadResult = await uploadToCloudinary(
            file.buffer,
            file.mimetype,
            "course-content"
          );
          if (uploadResult && uploadResult.secure_url) {
            Urls.push(uploadResult.secure_url);
          }
        }
      }

      const lesson = await Lesson.create({
        // courseId,
        title,
        objectives,
        link,
        files: Urls,
        instructorId,
      });

      // const curriculum = await Lesson.find({ courseId });

      return ResponseHandler.success(
        res,
        lesson,
        "Lesson uploaded successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  async createACourse(req: Request, res: Response) {
    try {
      const {
        title,
        objective,
        price,
        instructorId,
        duration,
        lessonFormat,
        lessons,
        assessments,
        announcements,
      } = req.body;

      const adminId = req.admin._id;

      // Validate `announcements` input
      if (!Array.isArray(announcements)) {
        return ResponseHandler.failure(
          res,
          "Announcements must be an array",
          400
        );
      }

      // Validate assessments
      const validAssessments = await Assessment.find({
        _id: { $in: assessments },
        instructorId: adminId,
      });
      if (validAssessments.length !== assessments.length) {
        return ResponseHandler.failure(
          res,
          "One or more assessments are invalid",
          400
        );
      }

      // Validate lessons
      const validLessons = await Lesson.find({
        _id: { $in: lessons },
        instructorId: adminId,
      });
      if (validLessons.length !== lessons.length) {
        return ResponseHandler.failure(
          res,
          "One or more lessons are invalid",
          400
        );
      }

      // Create announcements
      const announcementIds = await Promise.all(
        announcements.map(
          async (announcement: { title: string; details: string }) => {
            const newAnnouncement = await Announcement.create({
              title: announcement.title,
              details: announcement.details,
              courseIds: [],
            });
            return newAnnouncement._id as mongoose.Types.ObjectId;
          }
        )
      );

      // Create course
      const newCourse = await Course.create({
        title,
        objective,
        price,
        tutorId: instructorId, // The instructor teaching the course
        organizationId: adminId, // The organization creating the course
        duration,
        lessonFormat,
        lessons,
        assessments,
        announcements: announcementIds,
      });

      // Update announcements with the course ID
      await Announcement.updateMany(
        { _id: { $in: announcementIds } },
        { $push: { courseIds: newCourse._id } }
      );

      await Lesson.updateMany(
        { _id: { $in: lessons } },
        { $push: { courseIds: newCourse._id } }
      );

      return ResponseHandler.success(
        res,
        newCourse,
        "Course created successfully",
        201
      );
    } catch (error: any) {
      console.error("Error creating course:", error.message);
      return ResponseHandler.failure(
        res,
        `Server error: ${error.message}`,
        500
      );
    }
  }

  // async createLessonsHelper(
  //   lessons: Array<{ title: string; objectives: string[]; link: string; files: Express.Multer.File[] }>,
  //   courseId: string,
  //   instructorId: mongoose.Types.ObjectId
  // ) {
  //   const lessonIds: mongoose.Types.ObjectId[] = [];
  //   for (const lesson of lessons) {
  //     const Urls: string[] = [];

  //     if (lesson.files && lesson.files.length > 0) {
  //       for (const file of lesson.files) {
  //         const uploadResult = await uploadToCloudinary(
  //           file.buffer,
  //           file.mimetype,
  //           "course-content"
  //         );
  //         if (uploadResult && uploadResult.secure_url) {
  //           Urls.push(uploadResult.secure_url);
  //         }
  //       }
  //     }

  //     const newLesson = await Lesson.create({
  //       courseId,
  //       title: lesson.title,
  //       objectives: lesson.objectives,
  //       link: lesson.link,
  //       files: Urls,
  //     });
  //     lessonIds.push(newLesson._id as mongoose.Types.ObjectId);
  //   }
  //   return lessonIds;
  // }

  async getCourseLessons(req: Request, res: Response) {
    try {
      const { courseId } = req.params;

      const course = await Course.findById(courseId);
      if (!course) {
        return ResponseHandler.failure(res, "Course not found", 400);
      }

      const lessons = await Lesson.find({ courseId });

      return ResponseHandler.success(
        res,
        lessons,
        "Course curriculum fetched successfully"
      );
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        `Server error: ${error.message}`,
        500
      );
    }
  }

  async createAnnouncement(req: Request, res: Response) {
    try {
      const instructorId = req.admin._id;
      const { courseId } = req.params;
      const { title, details, courseList = [], sendEmail } = req.body;

      const validCourses = await Course.find({
        _id: { $in: courseList },
        instructorId: instructorId,
      });

      if (!validCourses.length) {
        return ResponseHandler.failure(res, "No valid courses found", 400);
      }

      const announcements = await Promise.all(
        validCourses.map((course) =>
          Announcement.create({
            title,
            details,
            courseIds: course._id,
          })
        )
      );

      if (sendEmail) {
        for (const course of validCourses) {
          const learners = course.learnerIds || [];

          for (const learnerId of learners) {
            await createNotification({
              userId: learnerId,
              courseId: course._id,
              message: `New announcement: ${title}`,
            });
          }
        }
      }

      return ResponseHandler.success(
        res,
        announcements,
        "Announcements created and notifications sent",
        201
      );
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        `Server error: ${error.message}`,
        500
      );
    }
  }

  async getAllAnnouncementsByCourse(req: Request, res: Response) {
    try {
      const { courseId } = req.params;

      const course = await Course.findById(courseId);
      if (!course) {
        return ResponseHandler.failure(res, "Course not found", 400);
      }

      const announcements = await Announcement.find({ courseId });

      return ResponseHandler.success(
        res,
        announcements,
        "Course announcements fetched successfully"
      );
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        `Server error: ${error.message}`,
        500
      );
    }
  }
}
