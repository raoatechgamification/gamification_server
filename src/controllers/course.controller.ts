import { Request, Response, NextFunction } from "express";
import { ResponseHandler } from "../middlewares/responseHandler.middleware";
import Course from "../models/course.model";

export class CourseController {
  async createCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const { instructorId } = req.admin._id;
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
}
