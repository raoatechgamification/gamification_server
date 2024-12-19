import mongoose from "mongoose";
import { Request, Response, NextFunction } from "express";
import { ResponseHandler } from "../middlewares/responseHandler.middleware";
import Course, { ICourse } from "../models/course.model";
import Lesson, { LessonDocument } from "../models/lesson.model";
import User from "../models/user.model";
import Announcement from "../models/announcement.model";
import Assessment from "../models/assessment.model";
import Submission from "../models/submission.model";
import { NotificationController } from "../controllers/notification.controller";
import { uploadToCloudinary } from "../utils/cloudinaryUpload";
import ObjectiveAssessment from "../models/objectiveAssessment.model";
import { CompletionDetails } from "../models/lesson.model";

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

  async getAllCoursesForUsers(req: Request, res: Response) {
    try {
      const courses = await Course.find(); // Fetch all courses without filtering by organizationId

      if (!courses || courses.length === 0) {
        return ResponseHandler.success(
          res,
          [],
          "No courses found. Start by creating a course!",
          200
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

  async getSingleCourse(req: Request, res: Response) {
    try {
      const { courseId } = req.params;

      const course = await Course.findById(courseId);

      if (!course) {
        return ResponseHandler.success(res, null, "Course not found", 404);
      }

      return ResponseHandler.success(
        res,
        course,
        "Course retrieved successfully",
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
            return ResponseHandler.failure(
              res,
              "File exceeds maximum size of 5GB",
              400
            );
          }

          try {
            const uploadResult = await uploadToCloudinary(
              file.buffer,
              file.mimetype,
              "course-content"
            );
            if (uploadResult && uploadResult.secure_url) {
              Urls.push(uploadResult.secure_url);
            }
          } catch (error) {
            console.error("Cloudinary Upload Error:", error);
            return ResponseHandler.failure(res, "Failed to upload file", 500);
          }

          // const uploadResult = await uploadToCloudinary(
          //   file.buffer,
          //   file.mimetype,
          //   "course-content"
          // );
          // if (uploadResult && uploadResult.secure_url) {
          //   Urls.push(uploadResult.secure_url);
          // }
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

  async getAllLessons(req: Request, res: Response, next: NextFunction) {
    try {
      const instructorId = req.admin._id;

      const lessons = await Lesson.find({ instructorId });

      if (!lessons || lessons.length === 0) {
        return ResponseHandler.failure(
          res,
          "No lessons found for this instructor",
          404
        );
      }

      return ResponseHandler.success(
        res,
        lessons,
        "Lessons retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  async createACourse(req: Request, res: Response) {
    try {
      const files = req.files as Express.Multer.File[];
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
        certificate,
        announcements,
        showInstructor,
      } = req.body;

      const adminId = req.admin._id;

      const codeExists = await Course.findOne({ courseCode: code });
      if (codeExists) {
        return ResponseHandler.failure(res, "Course code already exists", 400);
      }

      console.log("Code exists:", codeExists);

      if (assessments) {
        const validAssessments = await ObjectiveAssessment.find({
          _id: { $in: assessments },
          organizationId: adminId,
        });
        if (validAssessments.length !== assessments.length) {
          return ResponseHandler.failure(
            res,
            "One or more assessments are invalid",
            400
          );
        }
      }

      let validLessons;
      if (lessons) {
        validLessons = await Lesson.find({
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

      if (price === 0) price === "free";

      const courseData: any = {
        courseCode: code,
        title,
        objective,
        cost: price,
        courseImage: Urls[0],
        organizationId: adminId,
        duration,
        lessonFormat,
        lessons,
        assessments,
        certificate,
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

      if (lessons) {
        await Lesson.updateMany(
          { _id: { $in: lessons } },
          { $push: { courseIds: newCourse._id } }
        );
      }

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

  async editCourse(req: Request, res: Response) {
    try {
      const courseId = req.params.courseId;
      const adminId = req.admin._id;
      const updates = req.body;
      const files = req.files as Express.Multer.File[];

      const assessments = updates.assessments;
      if (assessments) {
        const validAssessments = await ObjectiveAssessment.find({
          _id: { $in: assessments },
          organizationId: adminId,
        });
        if (validAssessments.length !== assessments.length) {
          return ResponseHandler.failure(
            res,
            "One or more assessments are invalid",
            400
          );
        }
      }

      const lessons = updates.lessons;
      let validLessons;
      if (lessons) {
        validLessons = await Lesson.find({
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
      }

      let Urls: string[] = [];
      if (files && files.length > 0) {
        for (let file of files) {
          const uploadResult = await uploadToCloudinary(
            file.buffer,
            file.mimetype,
            "course-content"
          );
          if (uploadResult && uploadResult.secure_url) {
            Urls.push(uploadResult.secure_url);
          }
        }
        updates.courseImage = Urls; // Update courseImage if new files uploaded
      }

      // Handle announcements
      if (updates.announcements) {
        const announcementIds: mongoose.Types.ObjectId[] = [];

        for (const announcement of updates.announcements) {
          if (announcement._id) {
            // If _id exists, assume it's an existing announcement
            announcementIds.push(announcement._id as mongoose.Types.ObjectId);
          } else if (announcement.title && announcement.details) {
            // Create a new announcement if details are provided
            const newAnnouncement = await Announcement.create({
              title: announcement.title,
              details: announcement.details,
            });
            announcementIds.push(
              newAnnouncement._id as mongoose.Types.ObjectId
            );
          }
        }

        updates.announcements = announcementIds; // Replace with array of ObjectIds
      }

      const updatedCourse = await Course.findByIdAndUpdate(
        courseId,
        { $set: updates },
        { new: true, runValidators: true }
      );

      if (!updatedCourse) {
        return ResponseHandler.failure(res, "Course not found", 404);
      }

      if (updates.lessons) {
        await Lesson.updateMany(
          { _id: { $in: updates.lessons } },
          { $push: { courseIds: updatedCourse._id } }
        );
      }

      const courseResponse = updatedCourse.toObject();
      return ResponseHandler.success(
        res,
        courseResponse,
        "Course updated successfully",
        200
      );
    } catch (error: any) {
      console.error("Error updating course:", error.message);
      return ResponseHandler.failure(
        res,
        `Server error: ${error.message}`,
        500
      );
    }
  }

  // async editCourse(req: Request, res: Response) {
  //   try {
  //     const courseId = req.params.courseId;
  //     const updates = req.body;
  //     const files = req.files as Express.Multer.File[];

  //     let Urls: string[] = [];
  //     if (files && files.length > 0) {
  //       for (let file of files) {
  //         const uploadResult = await uploadToCloudinary(
  //           file.buffer,
  //           file.mimetype,
  //           "course-content"
  //         );
  //         if (uploadResult && uploadResult.secure_url) {
  //           Urls.push(uploadResult.secure_url);
  //         }
  //       }
  //       updates.courseImage = Urls; // Update courseImage if new files uploaded
  //     }

  //     const updatedCourse = await Course.findByIdAndUpdate(
  //       courseId,
  //       { $set: updates },
  //       { new: true, runValidators: true }
  //     );

  //     if (!updatedCourse) {
  //       return ResponseHandler.failure(res, "Course not found", 404);
  //     }

  //     if (updates.announcements) {
  //       await Announcement.updateMany(
  //         { _id: { $in: updates.announcements } },
  //         { $push: { courseIds: updatedCourse._id } }
  //       );
  //     }

  //     if (updates.lessons) {
  //       await Lesson.updateMany(
  //         { _id: { $in: updates.lessons } },
  //         { $push: { courseIds: updatedCourse._id } }
  //       );
  //     }

  //     const courseResponse = updatedCourse.toObject();
  //     return ResponseHandler.success(
  //       res,
  //       courseResponse,
  //       "Course updated successfully",
  //       200
  //     );
  //   } catch (error: any) {
  //     console.error("Error updating course:", error.message);
  //     return ResponseHandler.failure(res, `Server error: ${error.message}`, 500);
  //   }
  // }

  // async assignCourseToUsers(req: Request, res: Response) {
  //   try {
  //     const { userIds, dueDate } = req.body;
  //     const { courseId } = req.params;
  //     const adminId = req.admin._id;

  //     const course = await Course.findById(courseId);
  //     if (!course) {
  //       return ResponseHandler.failure(res, "Course not found", 404);
  //     }

  //     const validUsers = await User.find({
  //       _id: { $in: userIds },
  //       organizationId: adminId,
  //     });

  //     if (validUsers.length !== userIds.length) {
  //       return ResponseHandler.failure(
  //         res,
  //         "One or more users do not exist or are not under your organization",
  //         400
  //       );
  //     }

  //     let status = "unpaid";
  //     if (!course.cost || course.cost === 0) {
  //       status = "free";
  //     }

  //     const bulkUpdates = validUsers.map((user) => ({
  //       updateOne: {
  //         filter: {
  //           _id: user._id,
  //           "assignedPrograms.courseId": { $ne: courseId },
  //         },
  //         update: {
  //           $push: {
  //             assignedPrograms: {
  //               courseId: new mongoose.Types.ObjectId(courseId),
  //               dueDate: new Date(dueDate),
  //               status,
  //               amount: course.cost,
  //             },
  //             unattemptedPrograms: {
  //               course: course.toObject(),
  //               status,
  //             },
  //           },
  //         },
  //       },
  //     }));

  //     // PUSH THE COURSE DETAILS TO THE UNATTEMPTED PROGRAMS ARRAY

  //     const result = await User.bulkWrite(bulkUpdates);

  //     const learnersToAdd = validUsers.map((user) => ({
  //       userId: user._id,
  //       progress: 0,
  //     }));

  //     // Update course with assigned learners
  //     const updateQuery: any = {
  //       $addToSet: {
  //         assignedLearnersIds: {
  //           $each: validUsers.map((user) => ({ userId: user._id })),
  //         },
  //       },
  //     };

  //     // If the course is free, add to learnerIds as well
  //     if (status === "free") {
  //       updateQuery.$addToSet["learnerIds"] = { $each: learnersToAdd };
  //     }

  //     await Course.updateOne({ _id: courseId }, updateQuery);

  //     return ResponseHandler.success(
  //       res,
  //       {
  //         matchedCount: result.matchedCount,
  //         modifiedCount: result.modifiedCount,
  //         upsertedCount: result.upsertedCount,
  //       },
  //       "Course assigned to users successfully",
  //       200
  //     );
  //   } catch (error: any) {
  //     console.error("Error assigning course to users:", error.message);
  //     return ResponseHandler.failure(
  //       res,
  //       `Server error: ${error.message}`,
  //       500
  //     );
  //   }
  // }

  async assignCourseToUsers(req: Request, res: Response) {
    try {
      const { userIds, dueDate } = req.body;
      const { courseId } = req.params;
      const adminId = req.admin._id;

      // Fetch the course by ID
      const course = await Course.findById(courseId).lean(); // Use lean to return plain JavaScript object
      if (!course) {
        return ResponseHandler.failure(res, "Course not found", 404);
      }

      // Validate users
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

      // Determine course status
      let status = "unpaid";
      if (!course.cost || course.cost === 0) {
        status = "free";
      }

      // Prepare the sanitized course data for unattemptedPrograms
      const sanitizedCourse = {
        _id: course._id,
        title: course.title,
        objective: course.objective,
        certificate: course.certificate,
        tutorId: course.tutorId,
        organizationId: course.organizationId,
        duration: course.duration,
        courseCode: course.courseCode,
        lessonFormat: course.lessonFormat,
      };

      // Prepare bulk updates
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
              unattemptedPrograms: {
                course: sanitizedCourse,
                status,
              },
            },
          },
        },
      }));

      // Execute bulk write
      const result = await User.bulkWrite(bulkUpdates);

      // Add learners to the course
      const learnersToAdd = validUsers.map((user) => ({
        userId: user._id,
        progress: 0,
      }));

      // const updateQuery: any = {
      //   $addToSet: {
      //     assignedLearnersIds: {
      //       $each: validUsers.map((user) => ({ userId: user._id })),
      //     },
      //   },
      // };

      const updateQuery: any = {
        $addToSet: {
          learnerIds: { $each: learnersToAdd },
        },
      };

      if (status === "free") {
        updateQuery.$addToSet["learnerIds"] = { $each: learnersToAdd };
      }

      await Course.updateOne({ _id: courseId }, updateQuery);

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

  async lessonsWithProgress(req: Request, res: Response) {
    try {
      const { courseId } = req.params;
      const userId = req.user?.id;

      const lessons = await Lesson.find({ courseIds: courseId });

      const result = lessons.map((lesson) => ({
        lessonId: lesson._id,
        title: lesson.title,
        completedPercentage:
          lesson.completionDetails.find(
            (completion) => completion.userId.toString() === userId
          )?.percentage || 0,
      }));

      return ResponseHandler.success(
        res,
        result,
        "Lessons retrieved successfully.",
        200
      );
    } catch (error: any) {
      console.error("Error fetching lessons:", error.message);
      return ResponseHandler.failure(res, "Error fetching lessons", 500);
    }
  }

  async enrolledCoursesWithProgress(req: Request, res: Response) {
    try {
      const { userId } = req.user;

      // Fetch courses where the user is enrolled
      const courses = await Course.find({ "learnerIds.userId": userId })
        .populate({
          path: "lessons",
          model: Lesson,
        })
        .lean();

      // Type assertion for lessons after populate
      const populatedCourses = courses.map((course) => ({
        ...course,
        lessons: course.lessons as unknown as LessonDocument[], // Use `unknown` to bypass type incompatibility
      }));

      // Prepare the result with course and lesson progress
      const result = populatedCourses.map((course) => {
        // User's progress for the course
        const courseProgress =
          course.learnerIds?.find(
            (learner) => learner.userId.toString() === userId
          )?.progress || 0;

        // User's progress for each lesson in the course
        const lessons = course.lessons.map((lesson) => ({
          lessonId: lesson._id,
          title: lesson.title,
          completedPercentage:
            lesson.completionDetails.find(
              (completion) => completion.userId.toString() === userId
            )?.percentage || 0,
        }));

        return {
          courseId: course._id,
          courseTitle: course.title,
          courseProgress,
          lessons,
        };
      });

      return ResponseHandler.success(
        res,
        result,
        "Enrolled courses with progress retrieved successfully.",
        200
      );
    } catch (error: any) {
      console.error(
        "Error fetching enrolled courses with progress:",
        error.message
      );
      return ResponseHandler.failure(
        res,
        "Error fetching enrolled courses with progress",
        500
      );
    }
  }

  // async updateLessonCompletion(req: Request, res: Response) {
  //   try {
  //     const { lessonId, courseId } = req.params;
  //     const userId = req.user.id;
  //     const { percentage } = req.body;

  //     const userIdObjectId = new mongoose.Types.ObjectId(userId);
  //     const courseIdObjectId = new mongoose.Types.ObjectId(courseId);

  //     // Find the lesson by its ID
  //     const lesson = await Lesson.findById(lessonId);
  //     if (!lesson) {
  //       return ResponseHandler.failure(res, "Lesson not found.", 404);
  //     }

  //     // Check if the completion entry for the given userId and courseId exists
  //     const existingCompletion = lesson.completionDetails.find(
  //       (detail) =>
  //         detail.userId.equals(userIdObjectId) &&
  //         detail.courseId.equals(courseIdObjectId)
  //     );

  //     if (existingCompletion) {
  //       // Update the percentage if the entry exists
  //       existingCompletion.percentage = percentage;
  //     } else {
  //       // Add a new completion entry if none exists
  //       const newCompletion: CompletionDetails = {
  //         userId: userIdObjectId,
  //         courseId: courseIdObjectId,
  //         percentage,
  //       };
  //       lesson.completionDetails.push(newCompletion);
  //     }

  //     // Save the updated lesson
  //     await lesson.save();

  //     // If lesson completion is 100%, update course completion
  //     if (percentage === 100) {
  //       const user = await User.findById(userId);
  //       if (!user) {
  //         return ResponseHandler.failure(res, "User not found.", 404);
  //       }

  //       const courseCompletionStatus =
  //         user.lessonCompletionStatus?.[courseId] || {};

  //       courseCompletionStatus[lessonId] = 100;
  //       user.lessonCompletionStatus = {
  //         ...user.lessonCompletionStatus,
  //         [courseId]: courseCompletionStatus,
  //       };

  //       // Calculate overall course completion
  //       const totalLessons = Object.keys(courseCompletionStatus).length;
  //       const completedLessons = Object.values(courseCompletionStatus).filter(
  //         (p) => p === 100
  //       ).length;
  //       const courseCompletion = Math.floor(
  //         (completedLessons / totalLessons) * 100
  //       );

  //       // If course completion is 100%, handle assessment and program updates
  //       if (courseCompletion === 100) {
  //         const assessment = await ObjectiveAssessment.findOne({
  //           organizationId: user.organizationId,
  //           courseId,
  //         });

  //         const userSubmission = assessment
  //           ? await Submission.findOne({
  //               learnerId: userId,
  //               assessmentId: assessment._id,
  //             })
  //           : null;

  //         if (assessment && userSubmission) {
  //           // Initialize completedPrograms and ongoingPrograms if not present
  //           user.completedPrograms = user.completedPrograms ?? [];
  //           user.ongoingPrograms = user.ongoingPrograms ?? [];

  //           // Remove course from ongoing programs
  //           user.ongoingPrograms = user.ongoingPrograms.filter((program) => {
  //             if (program._id instanceof mongoose.Types.ObjectId) {
  //               return !program._id.equals(courseIdObjectId);
  //             }
  //             return true;
  //           });

  //           const completedProgram = {
  //             _id: courseIdObjectId,
  //             title: "Completed Course",
  //             instructorId: "InstructorId",
  //             courseImage: "ImageUrl",
  //             passMark: 100,
  //             dueDate: new Date(),
  //             status: "completed",
  //             amount: 0,
  //           };

  //           await User.findByIdAndUpdate(
  //             user._id,
  //             { $push: { completedPrograms: completedProgram } },
  //             { new: true }
  //           );
  //         }
  //       }

  //       await user.save();
  //     }

  //     return ResponseHandler.success(
  //       res,
  //       "Lesson completion updated successfully."
  //     );
  //   } catch (error: any) {
  //     return ResponseHandler.failure(
  //       res,
  //       error.message || "Failed to update lesson completion."
  //     );
  //   }
  // }

  async updateLessonCompletion(req: Request, res: Response) {
    try {
      const { lessonId, courseId } = req.params;
      const userId = req.user.id;
      const { percentage } = req.body;

      const userIdObjectId = new mongoose.Types.ObjectId(userId);
      const courseIdObjectId = new mongoose.Types.ObjectId(courseId);

      const lesson = await Lesson.findById(lessonId);
      if (!lesson) {
        return ResponseHandler.failure(res, "Lesson not found.", 404);
      }

      const existingCompletion = lesson.completionDetails.find(
        (detail) =>
          detail.userId.equals(userIdObjectId) &&
          detail.courseId.equals(courseIdObjectId)
      );

      if (existingCompletion) {
        existingCompletion.percentage = percentage; // Update percentage
      } else {
        const newCompletion: CompletionDetails = {
          userId: userIdObjectId,
          courseId: courseIdObjectId,
          percentage,
        };
        lesson.completionDetails.push(newCompletion); // Add new completion
      }

      await lesson.save();

      // if (percentage === 100) {
      //   const user = await User.findById(userId);
      //   if (!user) {
      //     return ResponseHandler.failure(res, "User not found.", 404);
      //   }

      //   const courseCompletionStatus =
      //     user.lessonCompletionStatus?.[courseId] || {};

      //   courseCompletionStatus[lessonId] = 100;

      //   user.lessonCompletionStatus = {
      //     ...user.lessonCompletionStatus,
      //     [courseId]: courseCompletionStatus,
      //   };

      //   const totalLessons = Object.keys(courseCompletionStatus).length;
      //   const completedLessons = Object.values(courseCompletionStatus).filter(
      //     (p) => p === 100
      //   ).length;

      //   const courseCompletion = Math.floor(
      //     (completedLessons / totalLessons) * 100
      //   );

      //   if (courseCompletion === 100) {
      //     const assessment = await ObjectiveAssessment.findOne({
      //       organizationId: user.organizationId,
      //       courseId,
      //     });

      //     const userSubmission = assessment
      //       ? await Submission.findOne({
      //           learnerId: userId,
      //           assessmentId: assessment._id,
      //         })
      //       : null;

      //     if (assessment && userSubmission) {
      //       user.completedPrograms = user.completedPrograms ?? [];
      //       user.ongoingPrograms = user.ongoingPrograms ?? [];

      //       const ongoingProgram = user.ongoingPrograms.find((program) => {
      //         if (program._id instanceof mongoose.Types.ObjectId) {
      //           return !program._id.equals(courseIdObjectId);
      //         }
      //         return true;
      //       });

      //       if (ongoingProgram) {
      //         await User.updateOne(
      //           { _id: userId },
      //           {
      //             $pull: { ongoingPrograms: { _id: courseIdObjectId } },
      //             $push: {
      //               completedPrograms: {
      //                 ...ongoingProgram,
      //                 status: "completed",
      //               },
      //             },
      //           }
      //         );
      //       }
      //     }
      //   }

      //   // Update user lessonCompletionStatus in the database
      //   await User.updateOne(
      //     { _id: userId },
      //     {
      //       $set: {
      //         [`lessonCompletionStatus.${courseId}`]: courseCompletionStatus,
      //       },
      //     }
      //   );
      // }

      if (percentage === 100) {
        const course = await Course.findById(courseId);
        if (!course) {
          return ResponseHandler.failure(res, "Course not found.", 404);
        }

        // Ensure the user exists in learnerIds array
        const learner = course.learnerIds?.find((l) =>
          l.userId.equals(userIdObjectId)
        );

        if (!learner) {
          course.learnerIds = course.learnerIds || [];

          course.learnerIds.push({ userId: userIdObjectId, progress: 0 });
        }

        // Calculate overall course progress
        const totalLessons = course.lessons?.length || 0;
        if (totalLessons === 0) {
          return ResponseHandler.failure(
            res,
            "No lessons found for the course.",
            400
          );
        }

        const completedLessons = await Lesson.countDocuments({
          _id: { $in: course.lessons },
          "completionDetails.userId": userIdObjectId,
          "completionDetails.percentage": 100,
        });

        const progress = Math.floor((completedLessons / totalLessons) * 100);

        // Update learner progress in the course
        await Course.updateOne(
          { _id: courseId, "learnerIds.userId": userIdObjectId },
          { $set: { "learnerIds.$.progress": progress } }
        );
      }

      return ResponseHandler.success(
        res,
        "Lesson completion updated successfully."
      );
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        error.message || "Failed to update lesson completion."
      );
    }
  }

  // async updateLessonCompletionn(req: Request, res: Response) {
  //   try {
  //     const { lessonId, courseId } = req.params;
  //     const userId = req.user.id;
  //     const { percentage } = req.body;

  //     // if (percentage < 0 || percentage > 100) {
  //     //   throw new CustomError("Percentage must be between 0 and 100.", 400);
  //     // }

  //     const userIdObjectId = new mongoose.Types.ObjectId(userId);
  //     const courseIdObjectId = new mongoose.Types.ObjectId(courseId);

  //     // Find the lesson by its ID
  //     const lesson = await Lesson.findById(lessonId);
  //     if (!lesson) {
  //       return ResponseHandler.failure(res, "Lesson not found.", 404);
  //     }

  //     // Check if the completion entry for the given userId and courseId exists
  //     const existingCompletion = lesson.completionDetails.find(
  //       (detail) =>
  //         detail.userId.equals(userIdObjectId) &&
  //         detail.courseId.equals(courseIdObjectId)
  //     );

  //     if (existingCompletion) {
  //       // Update the percentage if the entry exists
  //       existingCompletion.percentage = percentage;
  //     } else {
  //       // Add a new completion entry if none exists
  //       const newCompletion: CompletionDetails = {
  //         userId: userIdObjectId,
  //         courseId: courseIdObjectId,
  //         percentage,
  //       };
  //       lesson.completionDetails.push(newCompletion);
  //     }

  //     // Save the updated lesson
  //     await lesson.save();

  //     // If lesson completion is 100%, update course completion
  //     if (percentage === 100) {
  //       const user = await User.findById(userId);
  //       if (!user) {
  //         return ResponseHandler.failure(res, "User not found.", 404);
  //       }

  //       const courseCompletionStatus = user.lessonCompletionStatus?.[courseId] || {};
  //       courseCompletionStatus[lessonId] = 100;

  //       user.lessonCompletionStatus = {
  //         ...user.lessonCompletionStatus,
  //         [courseId]: courseCompletionStatus,
  //       };

  //       // Calculate overall course completion
  //       const totalLessons = Object.keys(courseCompletionStatus).length;
  //       const completedLessons = Object.values(courseCompletionStatus).filter(
  //         (p) => p === 100
  //       ).length;

  //       const courseCompletion = Math.floor(
  //         (completedLessons / totalLessons) * 100
  //       );

  //       // If course completion is 100%, handle assessment and program updates
  //       if (courseCompletion === 100) {
  //         const assessment = await ObjectiveAssessment.findOne({
  //           organizationId: user.organizationId,
  //           courseId,
  //         });

  //         const userSubmission = assessment
  //           ? await Submission.findOne({
  //               learnerId: userId,
  //               assessmentId: assessment._id,
  //             })
  //           : null;

  //         if (assessment && userSubmission) {
  //           // if (!user.completedPrograms) {
  //           //   user.completedPrograms = [];
  //           // }

  //           // if (!user.ongoingPrograms) {
  //           //   user.ongoingPrograms = [];
  //           // }

  //           // user.ongoingPrograms = user.ongoingPrograms.filter(
  //           //   (program) => !program._id.equals(courseIdObjectId)
  //           // );

  //           // user.ongoingPrograms = user.ongoingPrograms.filter((program) => {
  //           //   if (program._id instanceof mongoose.Types.ObjectId) {
  //           //     return !program._id.equals(courseIdObjectId);
  //           //   }
  //           // });

  //           user.completedPrograms = user.completedPrograms ?? [];
  //           user.ongoingPrograms = user.ongoingPrograms ?? [];

  //           // Remove course from ongoing programs
  //           user.ongoingPrograms = user.ongoingPrograms.filter((program) => {
  //             if (program._id instanceof mongoose.Types.ObjectId) {
  //               return !program._id.equals(courseIdObjectId);
  //             }
  //             return true;
  //           });

  //           // const completedProgram = {
  //           //   _id: courseIdObjectId,
  //           //   dueDate: new Date(),
  //           //   status: "completed",
  //           //   amount: 0,
  //           // };

  //           // user.completedPrograms.push(completedProgram);

  //           // await User.findByIdAndUpdate(
  //           //   user._id,
  //           //   { $push: { completedPrograms: completedProgram } },
  //           //   { new: true }
  //           // );

  //           const ongoingPrograms = user.ongoingPrograms?.find(
  //             (program) => (program.course as ICourse)._id?.toString() === courseId
  //           );

  //           await User.updateOne(
  //             { _id: userId },
  //             {
  //               $pull: { ongoingPrograms: { "course._id": courseId } },
  //               $push: { completedProgram: ongoingPrograms.course },
  //             }
  //           );
  //         }
  //       }

  //       await user.save();
  //     }

  //     return ResponseHandler.success(res, "Lesson completion updated successfully.");
  //   } catch (error: any) {
  //     return ResponseHandler.failure(
  //       res,
  //       error.message || "Failed to update lesson completion."
  //     );
  //   }
  // }

  async getCourseCompletionLevel(req: Request, res: Response) {
    try {
      const { courseId } = req.params;
      const userId = req.user.id;

      // Fetch the course and populate lessons and assessments
      const course = await Course.findById(courseId)
        .populate("lessons")
        .populate("assessments")
        .exec();

      if (!course) {
        return ResponseHandler.failure(res, "Course not found.", 404);
      }

      const lessons = course.lessons || [];
      const assessments = course.assessments || [];

      // Check if all lessons are completed
      const lessonsCompleted = await Promise.all(
        lessons.map(async (lessonId: mongoose.Types.ObjectId) => {
          const lesson = await Lesson.findById(lessonId);
          if (!lesson) return false;

          return lesson.completionDetails.some(
            (detail) =>
              detail.userId.toString() === userId.toString() &&
              detail.percentage === 100
          );
        })
      ).then((completedLessons) => completedLessons.every((status) => status));

      // Check if all assessments are submitted
      const assessmentsCompleted = await Promise.all(
        assessments.map(async (assessmentId: mongoose.Types.ObjectId) => {
          const submission = await Submission.findOne({
            assessmentId,
            userId,
          });
          return !!submission; // Assessment is completed if a submission exists
        })
      ).then((completedAssessments) =>
        completedAssessments.every((status) => status)
      );

      // Determine overall completion status
      const isCompleted =
        (lessons.length > 0 && assessments.length === 0 && lessonsCompleted) ||
        (lessons.length === 0 &&
          assessments.length > 0 &&
          assessmentsCompleted) ||
        (lessons.length > 0 &&
          assessments.length > 0 &&
          lessonsCompleted &&
          assessmentsCompleted);

      return ResponseHandler.success(res, {
        completed: isCompleted,
        message: isCompleted
          ? "Course completed"
          : "Course not yet completed. Please complete all lessons and assessments.",
      });
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        error.message || "Failed to fetch course completion level."
      );
    }
  }

  async getCourseDetails(req: Request, res: Response) {
    try {
      const { courseId } = req.params;
      const userId = req.user.id;

      // Fetch the course with lessons and assessments
      const course = await Course.findById(courseId)
        .populate("lessons")
        .populate("assessments")
        .exec();

      if (!course) {
        throw new Error("Course not found");
      }

      const lessons = course.lessons || [];
      const assessments = course.assessments || [];

      // Calculate the user's completion level for each lesson
      const lessonDetails = await Promise.all(
        lessons.map(async (lessonId: mongoose.Types.ObjectId) => {
          const lesson = await Lesson.findById(lessonId);
          if (!lesson) return null;

          const completionDetail = lesson.completionDetails.find(
            (detail) => detail.userId.toString() === userId.toString()
          );

          return {
            id: lesson.id,
            title: lesson.title,
            completionPercentage: completionDetail?.percentage || 0,
          };
        })
      );

      // Calculate the overall percentage of lessons completed
      const totalLessons = lessons.length;
      const completedLessonsPercentage =
        lessonDetails
          .filter((lesson) => lesson !== null)
          .reduce(
            (acc, lesson) => acc + (lesson?.completionPercentage || 0),
            0
          ) / totalLessons;

      // Check course completion level (reuse the logic from `getCourseCompletionLevel`)
      let lessonsCompleted = true;
      if (lessons.length > 0) {
        const completedLessons = await Promise.all(
          lessons.map(async (lessonId) => {
            const lesson = await Lesson.findById(lessonId);
            if (!lesson) return false;

            return lesson.completionDetails.some(
              (detail) =>
                detail.userId.toString() === userId.toString() &&
                detail.percentage === 100
            );
          })
        );
        lessonsCompleted = completedLessons.every((status) => status);
      }

      let assessmentsCompleted = true;
      if (assessments.length > 0) {
        const completedAssessments = await Promise.all(
          assessments.map(async (assessmentId) => {
            const submission = await Submission.findOne({
              assessmentId,
              userId,
            });
            return !!submission;
          })
        );
        assessmentsCompleted = completedAssessments.every((status) => status);
      }

      const isCompleted =
        (lessons.length > 0 && assessments.length === 0 && lessonsCompleted) ||
        (lessons.length === 0 &&
          assessments.length > 0 &&
          assessmentsCompleted) ||
        (lessons.length > 0 &&
          assessments.length > 0 &&
          lessonsCompleted &&
          assessmentsCompleted);

      // Calculate overall course completion percentage
      const totalItems = lessons.length + assessments.length;
      const completedLessons = lessonDetails.filter(
        (lesson) => lesson?.completionPercentage === 100
      ).length;
      const completedAssessments = await Promise.all(
        assessments.map(async (assessmentId) => {
          const submission = await Submission.findOne({ assessmentId, userId });
          return !!submission;
        })
      );
      const totalCompletedItems =
        completedLessons +
        completedAssessments.filter((status) => status).length;
      const completionPercentage = Math.round(
        (totalCompletedItems / totalItems) * 100
      );

      const completionStatus = {
        completed: isCompleted,
        completionPercentage,
        message: isCompleted
          ? "Course completed"
          : "Course not yet completed. Please complete all lessons and assessments.",
      };

      // Respond with the course, lessons, and completion status
      return ResponseHandler.success(res, {
        course: {
          id: course.id,
          title: course.title,
          description: course.description,
          lessons: lessonDetails.filter((lesson) => lesson !== null),
          completionStatus,
        },
      });
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        error.message || "Failed to fetch course details."
      );
    }
  }

  async moveCourseToOngoingList(req: Request, res: Response) {
    try {
      const { courseId } = req.params;
      const userId = req.user.id;

      const course = await Course.findById(courseId);
      if (!course) {
        return ResponseHandler.failure(res, "Course not found", 404);
      }

      const user = await User.findById(userId);
      if (!user) {
        return ResponseHandler.failure(res, "User not found", 404);
      }

      const assignedProgram = user.assignedPrograms?.find(
        (program) =>
          program.courseId.toString() === courseId &&
          (program.status === "paid" || program.status === "free")
      );

      if (!assignedProgram) {
        return ResponseHandler.failure(
          res,
          "Course is not assigned to the user, or it is not paid/free",
          400
        );
      }

      const unattemptedProgram = user.unattemptedPrograms?.find(
        (program) => (program.course as ICourse)._id?.toString() === courseId
      );

      if (!unattemptedProgram) {
        return ResponseHandler.failure(
          res,
          "Course is not in the unattempted programs list",
          400
        );
      }

      await User.updateOne(
        { _id: userId },
        {
          // $setOnInsert: { ongoingPrograms: [] },
          $pull: { unattemptedPrograms: { "course._id": courseId } },
          $push: { ongoingPrograms: unattemptedProgram.course },
        }
      );

      return ResponseHandler.success(
        res,
        { courseId, title: course.title },
        "Course moved to ongoing programs successfully"
      );
    } catch (error: any) {
      console.error("Error moving course to ongoing list:", error.message);
      return ResponseHandler.failure(
        res,
        "Error moving course to ongoing list",
        500
      );
    }
  }
}
