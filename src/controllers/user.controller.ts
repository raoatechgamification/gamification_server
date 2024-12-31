import { Request, Response, NextFunction } from "express";
import { ResponseHandler } from "../middlewares/responseHandler.middleware";
import User from "../models/user.model";
import Payment from "../models/payment.model";
import AssignedBill from "../models/bill.model";
import Course, { ICourse } from "../models/course.model";
import Lesson, { LessonDocument } from "../models/lesson.model";
import { comparePassword, hashPassword } from "../utils/hash";
import mongoose from "mongoose";

interface CompletionDetails {
  userId: string;
  percentage: number;
}

interface Lesson {
  _id: string;
  title: string;
  completionDetails: CompletionDetails[];
}

type PopulatedCourse = Omit<ICourse, "lessons"> & {
  lessons: LessonDocument[];
};

export class UserController {
  async editProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        yearsOfExperience,
        highestEducationLevel,
        gender,
        dateOfBirth,
        username,
        firstName,
        lastName,
        phone,
      } = req.body;

      const userId = req.user.id;
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            yearsOfExperience,
            highestEducationLevel,
            gender,
            dateOfBirth,
            username,
            firstName,
            lastName,
            phone,
          },
        },
        { new: true, runValidators: true }
      );

      if (!updatedUser) {
        return ResponseHandler.failure(res, "User not found", 404);
      }

      return ResponseHandler.success(
        res,
        updatedUser,
        "Profile updated successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  async billHistory(req: Request, res: Response) {
    try {
      const userId = req.user.id;

      const paidBills = await AssignedBill.find({
        assigneeId: userId,
        status: "paid",
      });

      if (paidBills.length === 0)
        return ResponseHandler.failure(
          res,
          "Your bill history is empty",
          404
        );

      return ResponseHandler.success(
        res,
        paidBills,
        "Payment history fetched successfully"
      );
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "An error occurred while retrieving your bill history",
        error: error.message,
      });
    }
  }

  async viewBill(req: Request, res: Response) {
    try {
      const { paymentId } = req.params;
      const userId = req.user.id;

      const paymentDetails = await Payment.findOne({ _id: paymentId });

      if (!paymentDetails)
        return ResponseHandler.failure(res, "Payment not found", 404);

      return ResponseHandler.success(
        res,
        paymentDetails,
        "Payment details fetched successfully"
      );
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "An error occurred while retrieving bill details",
        error: error.message,
      });
    }
  }

  async dueBills(req: Request, res: Response) {
    try {
      const userId = req.user.id;

      const dueBills = await AssignedBill.find({
        assigneeId: userId,
        status: "unpaid",
      });

      // The assigneeId can also be an organization, i.e. when assigneeType is 'group'

      if (dueBills.length === 0)
        return ResponseHandler.failure(
          res,
          "Your payment history is empty",
          404
        );

      return ResponseHandler.success(
        res,
        dueBills,
        "Payment history fetched successfully"
      );
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "An error occurred while fetching your due bills",
        error: error.message,
      });
    }
  }

  async updatePassword(req: Request, res: Response) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      const user = await User.findById(userId);
      if (!user) return ResponseHandler.failure(res, "User not found", 404);

      const hashedPassword = user.password;

      const currentPasswordIsValid = await comparePassword(
        currentPassword,
        hashedPassword
      );

      if (!currentPasswordIsValid) {
        return ResponseHandler.failure(
          res,
          "The current password you entered is incorrect",
          400
        );
      }

      const newHashedPassword = await hashPassword(newPassword);
      user.password = newHashedPassword;
      user.save();

      const userResponse = await User.findById(user._id).select(
        "-password -role"
      );
      return ResponseHandler.success(
        res,
        userResponse,
        "Your password has been updated successfully",
        200
      );
    } catch (error: any) {
      res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  }

  // async enrolledCoursesWithProgress(req: Request, res: Response) {
  //   try {
  //     const { userId } = req.user;
  
  //     const courses = await Course.find({ "learnerIds.userId": userId }).populate("lessons");
  
  //     const result = courses.map((course) => {
  //       const userProgress = course.learnerIds?.find(
  //         (u) => u.userId.toString() === userId
  //       )?.progress || 0;  // Default to 0 if not found
  //     });
  
  //     return ResponseHandler.success(res, result, "Enrolled courses retrieved successfully.", 200);
  //   } catch (error: any) {
  //     console.error("Error fetching enrolled courses:", error.message);
  //     return ResponseHandler.failure(res, "Error fetching enrolled courses", 500);
  //   }
  // }

    

  // async lessonsWithProgress(req: Request, res: Response) {
  //   try {
  //     const { courseId } = req.params;
  //     const userId = req.user?.id;
  
  //     const lessons = await Lesson.find({ courseId });
  
  //     const result = lessons.map((lesson) => ({
  //       lessonId: lesson._id,
  //       title: lesson.title,
  //       completedPercentage:
  //         lesson.completionDetails.find((completion) => completion.userId.toString() === userId)?.percentage || 0,
  //     }));
  
  //     return ResponseHandler.success(res, result, "Lessons retrieved successfully.", 200);
  //   } catch (error: any) {
  //     console.error("Error fetching lessons:", error.message);
  //     return ResponseHandler.failure(res, "Error fetching lessons", 500);
  //   }
  // }
  //   try {
  //     const { userId } = req.user;
  
  //     // Fetch all courses where the user is enrolled
  //     const courses = await Course.find({ "learnerIds.userId": userId })
  //       .populate({
  //         path: "lessons",
  //         model: "Lesson", // Reference the Lesson model
  //       })
  //       .lean();
  
  //     // Prepare result with progress for each course and its lessons
  //     const result = courses.map((course) => {
  //       // Get the user's progress for the course
  //       const courseProgress =
  //         course.learnerIds?.find((learner) => learner.userId.toString() === userId)?.progress || 0;
  
  //       // Map lessons to include progress for the user
  //       const lessons = course.lessons?.map((lesson) => ({
  //         lessonId: lesson._id,
  //         title: lesson.title,
  //         completedPercentage:
  //           lesson.completionDetails.find(
  //             (completion) => completion.userId.toString() === userId
  //           )?.percentage || 0,
  //       }));
  
  //       return {
  //         courseId: course._id,
  //         courseTitle: course.title,
  //         courseProgress,
  //         lessons,
  //       };
  //     });
  
  //     return ResponseHandler.success(
  //       res,
  //       result,
  //       "Enrolled courses with progress retrieved successfully.",
  //       200
  //     );
  //   } catch (error: any) {
  //     console.error("Error fetching enrolled courses with progress:", error.message);
  //     return ResponseHandler.failure(
  //       res,
  //       "Error fetching enrolled courses with progress",
  //       500
  //     );
  //   }
  // }  

  

  // async markLessonAsComplete(req: Request, res: Response) {
  //   try {
  //     const { courseId, lessonId } = req.params;
  //     const userId = req.user.id;
  
  //     // Step 1: Validate the lesson belongs to the specified course
  //     const lesson = await Lesson.findOne({ _id: lessonId, courseIds: courseId });
  //     if (!lesson) {
  //       return ResponseHandler.failure(res, "Lesson not found for the specified course", 404);
  //     }
  
  //     // Step 2: Update or create the lesson completion entry for the user
  //     const completionFilter = {
  //       _id: lessonId,
  //       "completionDetails.userId": userId,
  //       "completionDetails.courseId": courseId,
  //     };
  
  //     const completionUpdate = {
  //       $set: {
  //         "completionDetails.$[elem].percentage": 100,
  //       },
  //     };
  
  //     const arrayFilters = [{ "elem.userId": userId, "elem.courseId": courseId }];
  
  //     const updateResult = await Lesson.updateOne(completionFilter, completionUpdate, {
  //       arrayFilters,
  //       upsert: true,
  //     });
  
  //     // Step 3: Calculate the user's progress for the course
  //     const totalLessons = await Lesson.countDocuments({ courseIds: courseId });
  //     const completedLessons = await Lesson.countDocuments({
  //       courseIds: courseId,
  //       "completionDetails.userId": userId,
  //       "completionDetails.percentage": 100,
  //     });
  
  //     const progress = totalLessons > 0 ? Math.floor((completedLessons / totalLessons) * 100) : 0;
  
  //     // Step 4: Update progress in the Course document
  //     await Course.updateOne(
  //       { _id: courseId, "learnerIds.userId": userId },
  //       { $set: { "learnerIds.$.progress": progress } }
  //     );
  
  //     // Step 5: Transition course between user programs
  //     const user = await User.findById(userId);
  //     if (!user) {
  //       return ResponseHandler.failure(res, "User not found", 404);
  //     }
  
  //     const courseObjectId = new mongoose.Types.ObjectId(courseId);
  
  //     if (progress === 100) {
  //       // Move to completedPrograms
  //       await User.updateOne(
  //         { _id: userId },
  //         {
  //           $pull: { ongoingPrograms: { _id: courseObjectId } },
  //           $addToSet: { completedPrograms: courseObjectId },
  //         }
  //       );
  //     } else if (!user.ongoingPrograms?.some((program: ICourse) => program._id.toString() === courseId)) {
  //       // Move course to ongoingPrograms if not already there
  //       await User.updateOne(
  //         { _id: userId },
  //         {
  //           $pull: { unattemptedPrograms: { "course._id": courseId } },
  //           $addToSet: { ongoingPrograms: courseId },
  //         }
  //       );
  //     }
      
      
  
  //     // Step 6: Respond with success
  //     return ResponseHandler.success(res, {
  //       courseId,
  //       lessonId,
  //       progress,
  //     }, "Lesson marked as complete successfully.");
  
  //   } catch (error) {
  //     console.error("Error marking lesson as complete:", error);
  //     return ResponseHandler.failure(res, "An error occurred", 500);
  //   }
  // }
  
  async getAllUserCertificates(req: Request, res: Response) {
    try {
      const userId = req.user.id

      const user = await User.findById(userId, { certificates: 1, _id: 0 });

      if (!user) {
        return ResponseHandler.failure(res, "User not found", 404);
      }

      return ResponseHandler.success(
        res,
        user.certificates,
        "Certificates retrieved successfully.",
        200
      );
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        `Error generating user certificates: ${error.message}`,
        500
      );
    }
  }
}
