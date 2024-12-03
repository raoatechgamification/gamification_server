import mongoose from "mongoose";
import { Request, Response, NextFunction } from "express";
import { ResponseHandler } from "../middlewares/responseHandler.middleware";
import { AIGradingService } from "../services/AIgrading.service";
import MarkingGuide from "../models/markingGuide.model";
import Assessment from "../models/assessment.model";
import Submission from "../models/submission.model";
import Course from "../models/course.model";
import { uploadToCloudinary } from "../utils/cloudinaryUpload"

export class AssessmentController {
  async createAssessment(req: Request, res: Response) {
    try {
      const { title, question, highestAttainableScore } = req.body;
      // const { courseId } = req.params;
      const instructorId = req.admin._id;
      const file = req.file;

      // const course = await Course.findById(courseId);
      // if (!course) {
      //   return ResponseHandler.failure(res, "Course not found", 404);
      // }

      let fileUploadResult: any = null;

      if (file) {
        fileUploadResult = await uploadToCloudinary(file.buffer, file.mimetype, "assessment");

        // const filename = `${Date.now()}-${file.originalname}`;
        // const fileStream = file.buffer;
        // const contentType = file.mimetype;

        // const uploadParams = {
        //   Bucket: process.env.AWS_BUCKET!,
        //   Key: filename,
        //   Body: fileStream,
        //   ContentType: contentType,
        // };

        // fileUploadResult = await s3.upload(uploadParams).promise();
      }

      const assessment = await Assessment.create({
        title,
        question,
        highestAttainableScore,
        file: fileUploadResult ? fileUploadResult.secure_url : null, 
        // file: fileUploadResult ? fileUploadResult.Location : null,
        instructorId,
      });

      // I'll handle marking guide in a separate controller
      // await MarkingGuide.create({
      //   assessmentId: assessment._id,
      //   question: markingGuide.question,
      //   expectedAnswer: markingGuide.expectedAnswer,
      //   keywords: markingGuide.keywords.split(","),
      //   maxScore: highestAttainableScore,
      // });

      return ResponseHandler.success(
        res,
        assessment,
        "Assessment created successfully",
        201
      );
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        "Server error",
        500
      );
    }
  }

  async getSubmissionsForAssessment(
    req: Request,
    res: Response,
  ) {
    try {
      const { assessmentId } = req.params;
      const instructorId = req.admin._id;

      const assessment = await Assessment.findOne({
        _id: assessmentId,
        instructorId,
      });
      if (!assessment) {
        return ResponseHandler.failure(
          res,
          "Assessment not found for this instructor",
          404
        );
      }

      const submissions = await Submission.find({
        assessmentId,
      });

      res.status(200).json({
        message: "Submissions fetched successfully",
        data: submissions,
      });
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        "Server error",
        500
      );
    }
  }

  async gradeSubmission(req: Request, res: Response) {
    try {
      const { submissionId } = req.params;
      const instructorId = req.admin._id;
      const { score, comments, useAI } = req.body;

      const submission = await Submission.findById(submissionId);

      if (!submission) {
        return ResponseHandler.failure(res, "Submission not found", 404);
      }

      const assessment = await Assessment.findById(submission.assessmentId);

      if (!assessment) {
        return ResponseHandler.failure(
          res,
          "Associated assessment not found",
          404
        );
      }

      if (!new mongoose.Types.ObjectId(assessment.instructorId).equals(instructorId)) {
        return ResponseHandler.failure(
          res,
          "You are not authorized to grade this assessment",
          403
        );
      }

      if (submission.score !== undefined && submission.score !== null) {
        return ResponseHandler.failure(
          res,
          "Submission has already been graded.",
          400
        );
      }

      if (useAI) {
        const markingGuide = await MarkingGuide.findOne({
          assessmentId: assessment._id,
        });
        if (!markingGuide) {
          return ResponseHandler.failure(res, "Marking guide not found", 404);
        }

        const aiResult = await AIGradingService.gradeSubmission(
          submission.answer,
          markingGuide.expectedAnswer,
          markingGuide.keywords,
          markingGuide.maxScore
        );

        if (aiResult.error) {
          return ResponseHandler.failure(res, "AI Grading failed", 500);
        }

        submission.score = aiResult.score;
        submission.comments = aiResult.feedback;
      } else {
        if (score > assessment.highestAttainableScore) {
          return ResponseHandler.failure(
            res,
            `Score cannot exceed the highest attainable score of ${assessment.highestAttainableScore}.`,
            400
          );
        }

        submission.score = score;
        submission.comments = comments;
      }

      await submission.save();

      return ResponseHandler.success(
        res,
        submission,
        "Learner graded successfully"
      );
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        "Server error",
        500
      );
    }
  }
}
