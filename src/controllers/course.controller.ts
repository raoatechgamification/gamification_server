import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { NotificationController } from "../controllers/notification.controller";
import { ResponseHandler } from "../middlewares/responseHandler.middleware";
import Announcement from "../models/announcement.model";
import Course, { ICourse } from "../models/course.model";
import Lesson, { CompletionDetails } from "../models/lesson.model";
import ObjectiveAssessment, {
  IObjectiveAssessment,
} from "../models/objectiveAssessment.model";
import TheoryAssessment from "../models/theoryAssessment.model";
import Organization from "../models/organization.model";
import Submission from "../models/submission.model";
import User, { IUser } from "../models/user.model";
import { uploadToCloudinary } from "../utils/cloudinaryUpload";
import { getOrganizationId } from "../utils/getOrganizationId.util";

const { createNotification } = new NotificationController();

interface CompletionDetail {
  userId: mongoose.Types.ObjectId;
  percentage?: number;
  completed?: boolean;
}

interface LessonDocument extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  objectives?: string;
  link?: string;
  files?: string[];
  completionDetails: CompletionDetail[];
}

interface AssessmentDocument extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  totalMark?: number;
  passMark?: number;
  duration?: string;
  completionDetails: CompletionDetail[];
}

export class CourseController {
  async createCourse(req: Request, res: Response) {
    try {
      // const organizationId = req.admin._id;

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

      let organizationId = await getOrganizationId(req, res);
      if (!organizationId) {
        return;
      }

      const organization = await Organization.findById(organizationId);
      if (!organization) {
        return ResponseHandler.failure(res, "Organization not found", 404);
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
      // const organizationId = req.admin._id;

      let organizationId = await getOrganizationId(req, res);
      if (!organizationId) {
        return;
      }

      const organization = await Organization.findById(organizationId);
      if (!organization) {
        return ResponseHandler.failure(res, "Organization not found", 404);
      }

      // const courses = await Course.find({ organizationId, isArchived: false });

      const courses = await Course.find({ organizationId });

      if (!courses || courses.length === 0) {
        return ResponseHandler.failure(
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
      // const courses = await Course.find({ isArchived: false });
      const courses = await Course.find();

      if (!courses || courses.length === 0) {
        return ResponseHandler.failure(
          res,
          "No course found. Start by creating a course!",
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
      // const course = await Course.findOne({ _id: courseId, isArchived: false });

      if (!course) {
        return ResponseHandler.failure(res, "Course not found", 404);
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
      // const organizationId = req.admin._id;
      let organizationId = await getOrganizationId(req, res);
      if (!organizationId) {
        return;
      }

      const organization = await Organization.findById(organizationId);
      if (!organization) {
        return ResponseHandler.failure(res, "Organization not found", 404);
      }

      const { title, objectives, link } = req.body;
      const files = req.files as Express.Multer.File[];

      const Urls: string[] = [];

      if (files && files.length > 0) {
        for (const file of files) {
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
        }
      }

      const lesson = await Lesson.create({
        title,
        objectives,
        link,
        files: Urls,
        instructorId: organizationId,
      });

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
      // const instructorId = req.admin._id;

      let instructorId = await getOrganizationId(req, res);
      if (!instructorId) {
        return;
      }

      const organization = await Organization.findById(instructorId);
      if (!organization) {
        return ResponseHandler.failure(res, "Organization not found", 404);
      }

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
        instructor,
        duration,
        lessonFormat,
        lessons,
        assessments,
        // assessmentId,
        certificate,
        announcements,
        showInstructor,
      } = req.body;

      // const adminId = req.admin._id;
      let adminId = await getOrganizationId(req, res);
      if (!adminId) {
        return;
      }

      const organization = await Organization.findById(adminId);
      if (!organization) {
        return ResponseHandler.failure(res, "Organization not found", 404);
      }

      const codeExists = await Course.findOne({ courseCode: code });
      if (codeExists) {
        return ResponseHandler.failure(res, "Course code already exists", 400);
      }

      // const validAssessment = await ObjectiveAssessment.find({
      //   _id: assessmentId,
      //   organizationId: adminId,
      // }) || await TheoryAssessment.find({
      //   _id: assessmentId,
      //   organizationId: adminId,
      // });
      // if (!validAssessment) {
      //   return ResponseHandler.failure(
      //     res,
      //     "One or more assessments are invalid",
      //     400
      //   );
      // }

      if (assessments) {
        // const validAssessments = await ObjectiveAssessment.find({
        //   _id: { $in: assessments },
        //   organizationId: adminId,
        // }) || await TheoryAssessment.find({
        //   _id: { $in: assessments },
        //   organizationId: adminI333333333333333333d,
        // });

        const validAssessments = 
        // (await ObjectiveAssessment.find({
        //   _id: { $in: assessments },
        //   organizationId: adminId,
        // })) ||
        (await ObjectiveAssessment.find({
          _id: { $in: assessments },
          organizationId: adminId,
        }))

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

      if (!instructor) instructor = "Raoatech";

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
        // validAssessment,
        certificate,
        announcements: announcementIds,
        instructor,
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

      const courseResponse = newCourse.toObject() as Partial<typeof courseData>;

      if (!showInstructor) {
        delete courseResponse.instructor;
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

      // const adminId = req.admin._id;
      let adminId = await getOrganizationId(req, res);
      if (!adminId) {
        return;
      }

      const organization = await Organization.findById(adminId);
      if (!organization) {
        return ResponseHandler.failure(res, "Organization not found", 404);
      }

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

  async assignCourseToUsers(req: Request, res: Response) {
    try {
      const { userIds, dueDate } = req.body;
      const { courseId } = req.params;
      // const adminId = req.admin._id;

      let adminId = await getOrganizationId(req, res);
      if (!adminId) {
        return;
      }

      const organization = await Organization.findById(adminId);
      if (!organization) {
        return ResponseHandler.failure(res, "Organization not found", 404);
      }

      const course = await Course.findById(courseId).lean();
      // const course = await Course.findOne({ _id: courseId, isArchived: false }).lean();
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

      let status = "unpaid";
      if (!course.cost || course.cost === 0) {
        status = "free";
      }

      const sanitizedCourse = { ...course };
      delete sanitizedCourse.assignedLearnerIds;
      delete sanitizedCourse.learnerIds;

      await User.updateMany(
        {
          _id: { $in: validUsers.map((user) => user._id) },
          $or: [{ unattemptedPrograms: { $exists: false } }],
        },
        {
          $set: {
            ongoingPrograms: [],
            completedPrograms: [],
            unattemptedPrograms: [],
          },
        }
      );

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

      const result = await User.bulkWrite(bulkUpdates);

      const learnersToAdd = validUsers.map((user) => ({
        userId: user._id,
        progress: 0,
      }));

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
      // const course = await Course.findOne({ _id: courseId, isArchived: false });

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
      // const instructorId = req.admin._id;
      const { courseId } = req.params;
      const { title, details, courseList = [], sendEmail } = req.body;

      let instructorId = await getOrganizationId(req, res);
      if (!instructorId) {
        return;
      }

      const organization = await Organization.findById(instructorId);
      if (!organization) {
        return ResponseHandler.failure(res, "Organization not found", 404);
      }

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

      // const course = await Course.findById(courseId);
      const course = await Course.findOne({ _id: courseId, isArchived: false });
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

  async getPrograms(req: Request, res: Response) {
    try {
      const userId = req.user.id;

      // Fetch the specific fields for programs
      const userPrograms = await User.findById(userId, {
        unattemptedPrograms: 1,
        ongoingPrograms: 1,
        completedPrograms: 1,
      }).lean();

      if (!userPrograms) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.status(200).json(userPrograms);
    } catch (error) {
      console.error("Error fetching user programs:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async generalMarketPlace(req: Request, res: Response) {
    try {
      const userId = req.user.id; // Assume the user ID is passed in the URL params

      // Retrieve user data from the database (ensure this user exists)
      const user: IUser | null = await User.findById(userId).exec();

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Retrieve assigned program course IDs, handling cases where assignedPrograms is undefined
      const assignedProgramIds = (user?.assignedPrograms ?? []).map(
        (program) => program.courseId
      );

      // Query for courses that are not assigned to the user
      const availableCourses = await Course.find({
        _id: { $nin: assignedProgramIds },
      }).exec();
      // const availableCourses = await Course.find({
      //   _id: { $nin: assignedProgramIds },
      //   isArchived: false,
      // }).exec();

      return res.status(200).json({ availableCourses });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "An error occurred while fetching courses" });
    }
  }

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

      // Update or add completion details
      const existingCompletion = lesson.completionDetails.find(
        (detail) =>
          detail.userId.equals(userIdObjectId) &&
          detail.courseId.equals(courseIdObjectId)
      );

      if (existingCompletion) {
        existingCompletion.percentage = percentage;
      } else {
        const newCompletion: CompletionDetails = {
          userId: userIdObjectId,
          courseId: courseIdObjectId,
          percentage,
        };
        lesson.completionDetails.push(newCompletion);
      }

      await lesson.save();

      if (percentage === 100) {
        const course = await Course.findById(courseId).populate(
          "lessons assessments"
        );
        if (!course) {
          return ResponseHandler.failure(res, "Course not found.", 404);
        }

        // Calculate course progress
        const lessons = course.lessons || [];
        const assessments = course.assessments || [];
        const totalItems = lessons.length + assessments.length;

        const completedLessons = await Lesson.countDocuments({
          _id: { $in: lessons.map((lesson) => lesson._id) },
          "completionDetails.userId": userIdObjectId,
          "completionDetails.percentage": 100,
        });

        const completedItems = completedLessons;

        const overallProgress = Math.floor((completedItems / totalItems) * 100);

        // Update learner progress
        await Course.updateOne(
          { _id: courseId, "learnerIds.userId": userIdObjectId },
          { $set: { "learnerIds.$.progress": overallProgress } }
        );

        if (overallProgress === 100) {
          const user = await User.findById(userId);
          if (!user) {
            return ResponseHandler.failure(res, "User not found", 404);
          }

          const ongoingProgram = user.ongoingPrograms?.find(
            (program) =>
              (program.course as ICourse)._id?.toString() === courseId
          );

          if (!ongoingProgram) {
            return ResponseHandler.failure(
              res,
              "Course is not in the ongoing programs list",
              400
            );
          }

          const completedProgram = { ...ongoingProgram.course };
          delete completedProgram.assignedLearnerIds;
          delete completedProgram.learnerIds;

          await User.updateOne(
            { _id: userId },
            {
              $set: {
                ongoingPrograms: { $ifNull: ["$ongoingPrograms", []] },
                completedPrograms: { $ifNull: ["$completedPrograms", []] },
                unattemptedPrograms: { $ifNull: ["$unattemptedPrograms", []] },
              },
            }
          );

          await User.updateOne(
            { _id: userId },
            {
              $pull: { ongoingPrograms: { "course._id": courseId } },
              $push: { completedPrograms: { course: completedProgram } },
            }
          );
        }
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

      // Find the course by ID and populate lessons and assessments
      // const course = await Course.findById(courseId)
      const course = await Course.findOne({ _id: courseId})
        .populate<{ lessons: LessonDocument[] }>("lessons")
        .populate<{ assessments: AssessmentDocument[] }>("assessments"); // Ensure assessments are populated too

      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      const lessons = course.lessons ?? []; // Default to empty array if lessons are undefined
      const assessments = course.assessments ?? []; // Default to empty array if assessments are undefined

      // Fetch lesson details dynamically
      const lessonDetails = lessons.map((lesson) => {
        const userCompletion = lesson.completionDetails?.find(
          (detail) => detail.userId.toString() === userId
        );
        const completionPercentage = userCompletion?.percentage || 0;

        return {
          id: lesson._id,
          title: lesson.title,
          objectives: lesson.objectives || "",
          completionPercentage,
          link: lesson.link || "",
          files: lesson.files || [],
        };
      });

      const validLessons = lessonDetails.filter((lesson) => lesson !== null);

      // Calculate lesson completion
      const totalLessons = validLessons.length;
      const completedLessons = validLessons.filter(
        (lesson) => lesson.completionPercentage === 100
      ).length;

      // Calculate assessment completion
      const totalAssessments = assessments.length;
      const completedAssessments = assessments.filter((assessment) => {
        return (
          Array.isArray(assessment.completionDetails) &&
          assessment.completionDetails.some(
            (detail) => detail.userId.toString() === userId && detail.completed
          )
        );
      }).length;

      // Fetch user's progress for the course
      const learnerProgress =
        course.learnerIds?.find(
          (learner) => learner.userId.toString() === userId
        )?.progress || 0;

      const completionStatus = {
        completed: learnerProgress === 100,
        completionPercentage: learnerProgress,
        message:
          learnerProgress === 100
            ? "Course completed successfully!"
            : "Course not yet completed. Complete all lessons and assessments.",
      };

      // Send response
      return res.status(200).json({
        success: true,
        message: "Success",
        data: {
          course: {
            id: course._id,
            title: course.title,
            duration: course.duration,
            price: course.cost,
            instructor: course.instructor,
            lessons: validLessons,
            completionStatus,
            assessments,
          },
        },
      });
    } catch (error: any) {
      console.error("Error fetching course details:", error);
      return res.status(500).json({
        success: false,
        message: "Error fetching course details",
        error: error.message,
      });
    }
  }

  async getCourseDetailss(req: Request, res: Response) {
    try {
      const { courseId } = req.params;
      const userId = req.user.id;

      const course = await Course.findById(courseId)
        .populate<{ lessons: LessonDocument[] }>("lessons")
        .populate<{ assessments: IObjectiveAssessment[] }>("assessments");

      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      const lessons = course.lessons ?? [];
      const assessments = course.assessments ?? [];

      // Process assessments
      const processedAssessments = await Promise.all(
        assessments.map(async (assessment) => {
          const submissionCount = await Submission.countDocuments({
            assessmentId: assessment._id,
            learnerId: userId,
          });

          const remainingTrials = Math.max(
            0,
            (assessment.numberOfTrials ?? Infinity) - submissionCount
          );

          return {
            id: assessment._id,
            title: assessment.title,
            description: assessment.description || "",
            totalQuestions: assessment.questions.length,
            passMark: assessment.passMark,
            numberOfTrials: assessment.numberOfTrials,
            remainingTrials,
          };
        })
      );

      const validLessons = lessons.map((lesson) => {
        const userCompletion = lesson.completionDetails?.find(
          (detail) => detail.userId.toString() === userId
        );
        const completionPercentage = userCompletion?.percentage || 0;

        return {
          id: lesson._id,
          title: lesson.title,
          objectives: lesson.objectives || "",
          completionPercentage,
          link: lesson.link || "",
          files: lesson.files || [],
        };
      });

      const totalLessons = validLessons.length;
      const completedLessons = validLessons.filter(
        (lesson) => lesson.completionPercentage === 100
      ).length;

      const totalAssessments = processedAssessments.length;
      const completedAssessments = processedAssessments.filter(
        (assessment) => assessment.remainingTrials === 0
      ).length;

      const learnerProgress =
        course.learnerIds?.find(
          (learner) => learner.userId.toString() === userId
        )?.progress || 0;

      const completionStatus = {
        completed: learnerProgress === 100,
        completionPercentage: learnerProgress,
        message:
          learnerProgress === 100
            ? "Course completed successfully!"
            : "Course not yet completed. Complete all lessons and assessments.",
      };

      return res.status(200).json({
        success: true,
        message: "Success",
        data: {
          course: {
            id: course._id,
            title: course.title,
            lessons: validLessons,
            completionStatus,
            assessments: processedAssessments,
          },
        },
      });
    } catch (error: any) {
      console.error("Error fetching course details:", error);
      return res.status(500).json({
        success: false,
        message: "Error fetching course details",
        error: error.message,
      });
    }
  }

  async moveCourseToOngoingListt(req: Request, res: Response) {
    try {
      const { courseId } = req.params;
      const userId = req.user.id;

      const course = await Course.findById(courseId).lean();
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

      const sanitizedCourse = { ...unattemptedProgram.course };
      delete sanitizedCourse.assignedLearnerIds;
      delete sanitizedCourse.learnerIds;

      console.log("Handler got here");

      await User.updateOne(
        { _id: userId },
        {
          $set: {
            ongoingPrograms: { $ifNull: ["$ongoingPrograms", []] },
            completedPrograms: { $ifNull: ["$completedPrograms", []] },
            unattemptedPrograms: { $ifNull: ["$unattemptedPrograms", []] },
          },
        }
      );

      await User.updateOne(
        { _id: userId },
        {
          $pull: { unattemptedPrograms: { "course._id": courseId } },
          $push: { ongoingPrograms: { course: sanitizedCourse } },
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

  async moveCourseToOngoingList(req: Request, res: Response) {
    try {
      const { courseId } = req.params;
      const userId = req.user.id;

      // Find the course
      const course = await Course.findById(courseId).lean();
      if (!course) {
        return ResponseHandler.failure(res, "Course not found", 404);
      }

      // Find the user
      const user = await User.findById(userId);
      if (!user) {
        return ResponseHandler.failure(res, "User not found", 404);
      }

      // Ensure array fields are initialized
      await User.updateOne(
        { _id: userId },
        {
          $set: {
            ongoingPrograms: user.ongoingPrograms ?? [],
            completedPrograms: user.completedPrograms ?? [],
            unattemptedPrograms: user.unattemptedPrograms ?? [],
          },
        }
      );

      // Check assigned programs
      // const assignedProgram = user.assignedPrograms?.find(
      //   (program) =>
      //     program?.courseId?.toString() === courseId &&
      //     (program?.status === "paid" || program?.status === "free")
      // );
      // if (!assignedProgram) {
      //   return ResponseHandler.failure(
      //     res,
      //     "Course is not assigned to the user, or it is not paid/free",
      //     400
      //   );
      // }

      // Check unattempted programs
      const unattemptedProgram = user.unattemptedPrograms?.find(
        (program) => (program?.course as ICourse)?._id?.toString() === courseId
      );
      if (!unattemptedProgram) {
        return ResponseHandler.failure(
          res,
          "Course is not in the unattempted programs list",
          400
        );
      }

      // Sanitize course data
      const sanitizedCourse = { ...unattemptedProgram.course };
      delete sanitizedCourse.assignedLearnerIds;
      delete sanitizedCourse.learnerIds;

      // Update the user document
      await User.updateOne(
        { _id: userId },
        {
          $pull: { unattemptedPrograms: { "course._id": courseId } },
          $push: { ongoingPrograms: { course: sanitizedCourse } },
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
