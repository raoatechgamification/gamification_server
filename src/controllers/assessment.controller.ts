import { Request, Response, NextFunction } from "express";
import { ResponseHandler } from "../middlewares/responseHandler.middleware";
import { AIGradingService } from "../services/AIgrading.service";
import MarkingGuide from "../models/markingGuide.model";
import Assessment from "../models/assessment.model";
import Submission from "../models/submission.model";
import { s3 } from "../utils/upload.utils";

export class AssessmentController {
  async createAssessment(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, question, highestAttainableScore, markingGuide } =
        req.body;
      const { courseId, instructorId } = req.params;
      const file = req.file;

      let fileUploadResult: any = null;

      if (file) {
        const filename = `${Date.now()}-${file.originalname}`;
        const fileStream = file.buffer;
        const contentType = file.mimetype;

        const uploadParams = {
          Bucket: process.env.AWS_BUCKET!,
          Key: filename,
          Body: fileStream,
          ContentType: contentType,
        };

        fileUploadResult = await s3.upload(uploadParams).promise();
      }

      const assessment = await Assessment.create({
        title,
        question,
        highestAttainableScore,
        file: fileUploadResult ? fileUploadResult.Location : null,
        courseId,
        instructorId, // Replaced `createdBy` with `instructorId` as per the model
      });

      await MarkingGuide.create({
        assessmentId: assessment._id, // Mongoose uses `_id`
        question: markingGuide.question,
        expectedAnswer: markingGuide.expectedAnswer,
        keywords: markingGuide.keywords.split(","), // Ensure it's an array of strings
        maxScore: highestAttainableScore,
      });

      return ResponseHandler.success(
        res,
        assessment,
        "Assessment created successfully",
        201
      );
    } catch (error) {
      next(error);
    }
  }

  async getSubmissionsForAssessment(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { assessmentId, instructorId } = req.params;

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
    } catch (error) {
      next(error);
    }
  }

  async gradeSubmission(req: Request, res: Response, next: NextFunction) {
    try {
      const { submissionId, instructorId } = req.params;
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

      if (assessment.instructorId !== instructorId) {
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
          submission.answerText,
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
      next(error);
    }
  }
}
