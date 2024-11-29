import mongoose from "mongoose";
import { Request, Response, NextFunction } from "express";
import { ResponseHandler } from "../middlewares/responseHandler.middleware";
import Course from "../models/course.model";
import Lesson from "../models/lesson.model";
import User from "../models/user.model";
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
      let {
        code,
        title,
        objective,
        price,
        instructorId,
        duration,
        lessonFormat,
        lessons,
        assessments,
        announcements,
        showInstructor
      } = req.body;

      const adminId = req.admin._id;

      const codeExists = await Course.findOne({ code })
      if (codeExists) {
        return ResponseHandler.failure(
          res, 
          "Course code already exists",
          400
        )
      }

      if (assessments) {
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
      }

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

      let announcementIds;      

      if (announcements) {
        announcementIds = await Promise.all(
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
      }

      if (!price) price === "free"
      
      const courseData: any = {
        courseCode: code,
        title,
        objective,
        cost: price,
        organizationId: adminId,
        duration,
        lessonFormat,
        lessons,
        assessments,
        announcements: announcementIds,
        tutorId: instructorId,  
      };
  
      const newCourse = await Course.create(courseData);
  
      if (announcements) {
        await Announcement.updateMany(
          { _id: { $in: announcementIds } },
          { $push: { courseIds: newCourse._id } }
        );
      }
  
      await Lesson.updateMany(
        { _id: { $in: lessons } },
        { $push: { courseIds: newCourse._id } }
      );
  
      const courseResponse = newCourse.toObject();  
      if (!showInstructor) {
        delete courseResponse.tutorId;  
      }
  
      return ResponseHandler.success(
        res,
        courseResponse,  
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

  async assignCourseToUsers(req: Request, res: Response) {
    try {
      const { userIds, dueDate } = req.body; 
      const { courseId } = req.params;
      const adminId = req.admin._id;
  
      const course = await Course.findById(courseId);
      if (!course) {
        return ResponseHandler.failure(res, "Course not found", 404);
      }
  
      const validUsers = await User.find({
        _id: { $in: userIds },
        organizationId: adminId,
      });
  
      if (validUsers.length !== userIds.length) {
        return ResponseHandler.failure(
          res,
          "One or more users do not exist or are not under your organization",
          400
        );
      }

      console.log(course)
      let status = "unpaid";
      if (course.cost === "free") {
        status = "free"
      }
  
      const bulkUpdates = validUsers.map((user) => ({
        updateOne: {
          filter: {
            _id: user._id,
            "assignedPrograms.courseId": { $ne: courseId }, 
          },
          update: {
            $push: {
              assignedPrograms: {
                courseId: new mongoose.Types.ObjectId(courseId), 
                dueDate: new Date(dueDate), 
                status, 
                amount: course.cost, 
              },
            },
          },
        },
      }));
  
      const result = await User.bulkWrite(bulkUpdates);
  
      return ResponseHandler.success(
        res,
        {
          matchedCount: result.matchedCount,
          modifiedCount: result.modifiedCount,
          upsertedCount: result.upsertedCount,
        },
        "Course assigned to users successfully",
        200
      );
    } catch (error: any) {
      console.error("Error assigning course to users:", error.message);
      return ResponseHandler.failure(
        res,
        `Server error: ${error.message}`,
        500
      );
    }
  }  

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
