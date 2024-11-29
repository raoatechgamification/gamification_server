import mongoose from "mongoose";
import { Request, Response } from "express";
import { ResponseHandler } from "../middlewares/responseHandler.middleware";
import ReassignedCourse from "../models/courseReassignment.model";
import Course from "../models/course.model";

export class CourseReassignment {
  async reassignCourse(req: Request, res: Response) {
    try {
      const { code, courseId, title, duration, startDate, endDate, cost, instructorId, learnerIds, assessment } = req.body;

      const adminId = req.admin._id;

      // Validate course code
      const codeExists = 
      (await Course.findOne({ code }) || await ReassignedCourse.findOne({ code }))
      if (codeExists) {
        return ResponseHandler.failure(
          res, 
          "Course code already exists",
          400
        )
      }

      // Validate course
      const courseExists = await Course.findOne({ _id: courseId })
      if (!courseExists) {
        return ResponseHandler.failure(
          res, 
          "Course not found",
          400
        )
      }

      // Validate assessments

      // validate instructor

      // If other necessary details are not passed used the values of the original course.
      
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        `Server error: ${error.message}`,
        500
      );
    }
  }
}