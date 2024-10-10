import mongoose from "mongoose";
import { Request, Response, NextFunction } from "express";
import { ResponseHandler } from "../middlewares/responseHandler.middleware";
import Course from "../models/course.model";
import CourseContent from "../models/courseContent.model";
import { uploadToCloudinary } from "../utils/cloudinaryUpload";

export class CourseController {
  async createCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const instructorId = req.admin._id;
      const { title, objective, price, duration, lessonFormat } = req.body;

      const course = await Course.create({
        title,
        objective,
        price,
        instructorId,
        duration,
        lessonFormat,
      });

      return ResponseHandler.success(
        res,
        course,
        "Course created successfully",
        201
      );
    } catch (error) {
      next(error);
    }
  }

  async createCourseContent(req: Request, res: Response, next: NextFunction) {
    try {
      const instructorId = req.admin._id;
      const { courseId } = req.params;
      const { title, objectives, link } = req.body;

      const files = req.files as Express.Multer.File[];

      const course = await Course.findById(courseId);
      if (
        !course ||
        !new mongoose.Types.ObjectId(course.instructorId).equals(instructorId)
      ) {
        return ResponseHandler.failure(
          res,
          "You are not authorized to add contents to this course",
          403
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

      const courseContent = await CourseContent.create({
        courseId,
        title,
        objectives,
        link,
        files: Urls,
      });

      const curriculum = await CourseContent.find({ courseId });

      return ResponseHandler.success(
        res,
        curriculum,
        "Course curriculum updated successfully"
      );
    } catch (error) {
      next(error);
    }
  }
}
