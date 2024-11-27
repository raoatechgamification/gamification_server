import { Request, Response, NextFunction } from "express";
import { ResponseHandler } from "../middlewares/responseHandler.middleware";
import User from "../models/user.model";
import Payment from "../models/payment.model";
import AssignedBill from "../models/bill.model";
import Course from "../models/course.model";
import Lesson from "../models/lesson.model";
import { comparePassword, hashPassword } from "../utils/hash";

interface CompletionDetails {
  userId: string;
  percentage: number;
}

interface Lesson {
  _id: string;
  title: string;
  completionDetails: CompletionDetails[];
}

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
          "Your payment history is empty",
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

  async userPrograms(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
  
      const user = await User.findById(userId).select("+ongoingPrograms +completedPrograms");
  
      if (!user) return ResponseHandler.failure(res, "User not found", 404);
  
      const userPrograms = {
        ongoingPrograms: user.ongoingPrograms || [],
        completedPrograms: user.completedPrograms || [],
      };
  
      const message =
        userPrograms.ongoingPrograms.length || userPrograms.completedPrograms.length
          ? "Programs retrieved successfully."
          : "You have no ongoing or completed programs. Enroll in a program today.";
  
      return ResponseHandler.success(res, userPrograms, message, 200);
    } catch (error: any) {
      console.error("Error retrieving user programs:", error.message);
      return ResponseHandler.failure(res, "Error retrieving user programs", 500);
    }
  }

  async enrolledCoursesWithProgress(req: Request, res: Response) {
    try {
      const { userId } = req.user;
  
      const courses = await Course.find({ "learnerIds.userId": userId }).populate("lessons");
  
      const result = courses.map((course) => {
        const userProgress = course.learnerIds?.find(
          (u) => u.userId.toString() === userId
        )?.progress || 0;  // Default to 0 if not found
      });
  
      return ResponseHandler.success(res, result, "Enrolled courses retrieved successfully.", 200);
    } catch (error: any) {
      console.error("Error fetching enrolled courses:", error.message);
      return ResponseHandler.failure(res, "Error fetching enrolled courses", 500);
    }
  }

  async lessonsWithProgress(req: Request, res: Response) {
    try {
      const { courseId } = req.params;
      const userId = req.user?.id;
  
      const lessons = await Lesson.find({ courseId });
  
      const result = lessons.map((lesson) => ({
        lessonId: lesson._id,
        title: lesson.title,
        completedPercentage:
          lesson.completionDetails.find((completion) => completion.userId.toString() === userId)?.percentage || 0,
      }));
  
      return ResponseHandler.success(res, result, "Lessons retrieved successfully.", 200);
    } catch (error: any) {
      console.error("Error fetching lessons:", error.message);
      return ResponseHandler.failure(res, "Error fetching lessons", 500);
    }
  }

  async markLessonAsComplete(req: Request, res: Response) {
    try {
      const { lessonId } = req.params;
      const userId = req.user?.id;
  
      // Update lesson completion
      const lessonUpdateResult = await Lesson.updateOne(
        { _id: lessonId, "completionDetails.userId": userId },
        { $set: { "completionDetails.$.percentage": 100 } },
        { upsert: true }
      );
  
      if (lessonUpdateResult.matchedCount === 0) {
        return ResponseHandler.failure(res, "Lesson not found or update failed", 404);
      }
  
      // Retrieve the lesson to get courseIds
      const lesson = await Lesson.findById(lessonId);
      if (!lesson) return ResponseHandler.failure(res, "Lesson not found", 404);
  
      if (!lesson.courseIds || lesson.courseIds.length === 0) {
        return ResponseHandler.failure(res, "Lesson does not belong to any course", 400);
      }
  
      // Iterate through all related courses to update progress
      const userProgressUpdates = await Promise.all(
        lesson.courseIds.map(async (courseId) => {
          const totalLessons = await Lesson.countDocuments({ courseIds: courseId });
          const completedLessons = await Lesson.countDocuments({
            courseIds: courseId,
            "completionDetails.userId": userId,
            "completionDetails.percentage": 100,
          });
  
          const progress = totalLessons > 0 ? Math.floor((completedLessons / totalLessons) * 100) : 0;
  
          const courseUpdateResult = await Course.updateOne(
            { _id: courseId, "learnerIds.userId": userId },
            { $set: { "learnerIds.$.progress": progress } }
          );
  
          return {
            courseId,
            progress,
            courseUpdated: courseUpdateResult.modifiedCount > 0,
          };
        })
      );
  
      return ResponseHandler.success(
        res,
        { userProgressUpdates },
        "Lesson marked as complete and progress updated for related courses.",
        200
      );
    } catch (error: any) {
      console.error("Error marking lesson as complete:", error.message);
      return ResponseHandler.failure(res, "Error marking lesson as complete", 500);
    }
  }
  

  // async markLessonAsComplete(req: Request, res: Response) {
  //   try {
  //     const { lessonId } = req.params;
  //     const userId = req.user?.id;
  
  //     // Update lesson completion
  //     await Lesson.updateOne(
  //       { _id: lessonId, "completionDetails.userId": userId },
  //       { $set: { "completionDetails.$.percentage": 100 } },
  //       { upsert: true }
  //     );
  
  //     // Update course progress
  //     const lesson = await Lesson.findById(lessonId);
  //     if (!lesson) return ResponseHandler.failure(res, "Lesson not found", 404);
  
  //     const totalLessons = await Lesson.countDocuments({ courseId: lesson.courseId });
  //     const completedLessons = await Lesson.countDocuments({
  //       courseId: lesson.courseId,
  //       "completionDetails.userId": userId,
  //       "completionDetails.percentage": 100,
  //     });
  
  //     const progress = Math.floor((completedLessons / totalLessons) * 100);
  
  //     await Course.updateOne(
  //       { _id: lesson.courseId, "learnerIds.userId": userId },
  //       { $set: { "learnerIds.$.progress": progress } }
  //     );
  
  //     return ResponseHandler.success(res, { progress }, "Lesson marked as complete.", 200);
  //   } catch (error: any) {
  //     console.error("Error marking lesson as complete:", error.message);
  //     return ResponseHandler.failure(res, "Error marking lesson as complete", 500);
  //   }
  // }

  // async courseAndLessonProgress(req: Request, res: Response) {
  //   try {
  //     const { courseId } = req.params;
  //     const userId = req.user?.id;
  
  //     const course = await Course.findById(courseId).populate("lessons");
  //     if (!course) return ResponseHandler.failure(res, "Course not found", 404);
  
  //     const lessons = course.lessons;
  //     const completedLessons = lessons.filter((lesson) =>
  //       lesson.completionDetails.some(
  //         (completion) => completion.userId.toString() === userId && completion.percentage === 100
  //       )
  //     );
  
  //     const courseProgress = Math.floor((completedLessons.length / lessons.length) * 100);
  //     const lessonProgress = lessons.map((lesson) => ({
  //       lessonId: lesson._id,
  //       title: lesson.title,
  //       completedPercentage:
  //         lesson.completionDetails.find((completion) => completion.userId.toString() === userId)?.percentage || 0,
  //     }));
  
  //     return ResponseHandler.success(res, { courseProgress, lessonProgress }, "Progress retrieved successfully.", 200);
  //   } catch (error: any) {
  //     console.error("Error fetching progress:", error.message);
  //     return ResponseHandler.failure(res, "Error fetching progress", 500);
  //   }
  // }

  // async userPrograms (req: Request, res: Response) {
  //   try {
  //     const userId = req.user.id;

  //     const user = await User.findById(userId)
  //     if ( !user ) return ResponseHandler.failure(res, "User not found", 404);

  //     const userPrograms = await User.find(userId).select("+ongoingPrograms +completedPrograms")
  //     if (!userPrograms) {
  //       return ResponseHandler.success(
  //         res,
  //         "No have to ongoing nor completed programs. Enroll in a program today."
  //       )
  //     }

  //     return ResponseHandler.success(
  //       res,
  //       userPrograms,
  //       "Your password has been updated successfully",
  //       200
  //     )
  //   } catch (error: any) {
  //     res.status(500).json({
  //       message: "Server error",
  //       error: error.message,
  //     });
  //   }
  // }

  // async userPrograms(req: Request, res: Response) {
  //   try {
  //     const userId = req.user.id;

  //     const user = await User.findById(userId).select(
  //       "+ongoingPrograms +completedPrograms"
  //     );

  //     if (!user) {
  //       return ResponseHandler.failure(res, "User not found", 404);
  //     }

  //     if (!user.ongoingPrograms?.length && !user.completedPrograms?.length) {
  //       return ResponseHandler.success(
  //         res,
  //         null,
  //         "You have no ongoing or completed programs. Enroll in a program today.",
  //         200
  //       );
  //     }

  //     const userPrograms = {
  //       ongoingPrograms: user.ongoingPrograms || [],
  //       completedPrograms: user.completedPrograms || [],
  //     };

  //     return ResponseHandler.success(
  //       res,
  //       userPrograms,
  //       "Programs retrieved successfully",
  //       200
  //     );
  //   } catch (error: any) {
  //     console.error("Error retrieving user programs:", error.message);
  //     return ResponseHandler.failure(res, "Error retrieving user programs", 500);
  //   }
  // }

  // async enrolledCoursesWithProgress(req: Request, res: Response) {
  //   try {
  //     const { userId } = req.params;

  //     const courses = await Course.find({ 'enrolledUsers.userId': userId })
  //     .populate('lessons')
  //     .select('title description enrolledUsers');

  //     const result = courses.map(course => {
  //       const userProgress = course.learnerIds.find(u => u.userId.toString() === userId)?.progress || 0;
  //       return {
  //         courseId: course._id,
  //         title: course.title,
  //         description: course.objective,
  //         progress: userProgress,
  //       };
  //     });

  //     res.json(result);
  //   } catch (error: any) {
  //     console.error("Error fetching enrolled courses", error.message);
  //     return ResponseHandler.failure(res, "Error fetching enrolled courses", 500);
  //   }
  // }

  // async lessonsWithProgress(req: Request, res: Response) {
  //   try {
  //     const { courseId, userId } = req.params;
  //     const lessons = await Lesson.find({ courseId: courseId });

  //     const result = lessons.map(lesson => ({
  //       lessonId: lesson._id,
  //       title: lesson.title,
  //       completed: lesson.completedBy.includes(userId),
  //     }));

  //     res.json(result);
  //   } catch (error: any) {
  //     console.error("Error fetching lessons", error.message);
  //     return ResponseHandler.failure(res, "Error fetching lessons", 500);
  //   }
  // }

  // async markLessonAsComplete(req: Request, res: Response) {
  //   try {
  //     const { lessonId } = req.params;
  //     const { userId } = req.body;

  //     await Lesson.findByIdAndUpdate(lessonId, { $addToSet: { completedBy: userId } });

  //     // Update course progress
  //     const lesson = await Lesson.findById(lessonId).populate('course');
  //     const totalLessons = await Lesson.countDocuments({ course: lesson?.course });
  //     const completedLessons = await Lesson.countDocuments({ course: lesson?.course, completedBy: userId });
  //     const progress = Math.floor((completedLessons / totalLessons) * 100);

  //     await Course.findOneAndUpdate(
  //       { _id: lesson?.course, 'enrolledUsers.userId': userId },
  //       { $set: { 'enrolledUsers.$.progress': progress } }
  //     );

  //     res.json({ message: 'Lesson marked as complete.' });
  //   } catch (error: any) {
  //     console.error("Error fetching lessons", error.message);
  //     return ResponseHandler.failure(res, "Server error", 500);
  //   }
  // }

  // async overallCourseCompletion(req: Request, res: Response) {
  //   const { lessonId } = req.params;
  //   const { userId } = req.body;

  //   try {
  //     const lesson = await Lesson.findById(lessonId);
  //     if (!lesson) return res.status(404).json({ error: 'Lesson not found' });

  //     // Mark the lesson as completed for the user
  //     await Lesson.findByIdAndUpdate(lessonId, { $addToSet: { completedBy: userId } });

  //     // Get all lessons for the course
  //     const totalLessons = await Lesson.countDocuments({ course: lesson.course });
  //     const completedLessons = await Lesson.countDocuments({ course: lesson.course, completedBy: userId });

  //     // Calculate progress percentage
  //     const progress = Math.floor((completedLessons / totalLessons) * 100);

  //     // Update the course's progress for the user
  //     await Course.findOneAndUpdate(
  //       { _id: lesson.course, 'enrolledUsers.userId': userId },
  //       { $set: { 'enrolledUsers.$.progress': progress } }
  //     );

  //     res.json({ message: 'Lesson marked as complete.', progress });
  //   } catch (err) {
  //     res.status(500).json({ error: 'Error marking lesson as complete.' });
  //   }
  // }

  // async overallLessonCompletion(req: Request, res: Response) {
  //   const { lessonId } = req.params;
  //   const { userId, percentage } = req.body; // E.g., percentage = 18 for 18%

  //   try {
  //     await Lesson.findOneAndUpdate(
  //       { _id: lessonId, 'completionDetails.userId': userId },
  //       { $set: { 'completionDetails.$.percentage': percentage } },
  //       { upsert: true }
  //     );

  //     res.json({ message: 'Lesson progress updated successfully.' });
  //   } catch (err) {
  //     res.status(500).json({ error: 'Error updating lesson progress.' });
  //   }
  // }

  // async downloadLesson(req: Request, res: Response) {
  //   const { lessonId } = req.params;

  //   try {
  //     const lesson = await Lesson.findById(lessonId);
  //     if (!lesson) return res.status(404).json({ error: 'Lesson not found' });

  //     const videoUrl = cloudinary.v2.utils.signed_download_url(lesson.videoUrl, {
  //       expires_at: Math.floor(Date.now() / 1000) + 3600, // URL expires in 1 hour
  //       resource_type: 'video',
  //     });

  //     res.json({ downloadUrl: videoUrl });
  //   } catch (err) {
  //     res.status(500).json({ error: 'Error generating download URL.' });
  //   }
  // }

  // async courseAndLessonProgress(req: Request, res: Response) {
  //   const { userId, courseId } = req.params;

  //   try {
  //     const course = await Course.findById(courseId).populate('lessons');
  //     if (!course) return res.status(404).json({ error: 'Course not found' });

  //     const lessons = await Lesson.find({ course: courseId });
  //     const completedLessons = lessons.filter(lesson =>
  //       lesson.completedBy.includes(userId)
  //     ).length;

  //     const courseProgress = Math.floor((completedLessons / lessons.length) * 100);

  //     const lessonProgress = lessons.map(lesson => ({
  //       lessonId: lesson._id,
  //       title: lesson.title,
  //       completed: lesson.completedBy.includes(userId),
  //     }));

  //     res.json({ courseProgress, lessonProgress });
  //   } catch (err) {
  //     res.status(500).json({ error: 'Error fetching progress.' });
  //   }
  // }
}
