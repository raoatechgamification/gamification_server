import { Request, Response } from "express";
import TheoryAssessment from "../models/theoryAssessment.model";
import { ResponseHandler } from "../middlewares/responseHandler.middleware"
import Submission from "../models/submission.model";
import { getOrganizationId } from "../utils/getOrganizationId.util";
import Organization from "../models/organization.model";


class TheoryAssessmentController {
  async createTheoryAssessment(req: Request, res: Response) {
    try {
      const {
        title,
        description,
        passMark,
        totalMark,
        duration,
        questions,
        assessmentCode,
      } = req.body;

      let organizationId = await getOrganizationId(req, res);
      if (!organizationId) {
        return;
      }

      const organization = await Organization.findById(organizationId);
      if (!organization) {
        return ResponseHandler.failure(res, "Organization not found", 400);
      }

      if (
        !title ||
        !description ||
        !duration ||
        !passMark ||
        !totalMark ||
        !Array.isArray(questions) ||
        questions.length === 0
      ) {
        return ResponseHandler.failure(
          res,
          "Title, description, duration, pass mark, total mark, and questions are required.",
          400
        );
      }

      const lastAssessment = await TheoryAssessment.findOne().sort({
        position: -1,
      });
      const position = lastAssessment ? lastAssessment.position + 1 : 1;

      const code = assessmentCode || `EXT-${position}`;

      // const newAssessment = await TheoryAssessment.create(req.body);

      const newAssessment = await TheoryAssessment.create({
        organizationId,
        title,
        description,
        position,
        totalMark,
        passMark,
        duration,
        assessmentCode: code,
        questions
      })

      return ResponseHandler.success(res, newAssessment, "Assessment created successfully");
    } catch (error: any) {
      return ResponseHandler.failure(res, error.message);
    }
  }

  async editTheoryAssessment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const {
        title,
        description,
        passMark,
        totalMark,
        duration,
        questions,
        assessmentCode,
      } = req.body;

      let organizationId = await getOrganizationId(req, res);
      if (!organizationId) {
        return;
      }

      const organization = await Organization.findById(organizationId);
      if (!organization) {
        return ResponseHandler.failure(res, "Organization not found", 400);
      }

      if (
        !title ||
        !description ||
        !duration ||
        !passMark ||
        !totalMark ||
        !Array.isArray(questions) ||
        questions.length === 0
      ) {
        return ResponseHandler.failure(
          res,
          "Title, description, duration, pass mark, total mark, and questions are required.",
          400
        );
      }

      const assessment = await TheoryAssessment.findOne({
        _id: id,
        organizationId,
      });

      if (!assessment) {
        return ResponseHandler.failure(res, "Assessment not found.", 404);
      }

      assessment.title = title || assessment.title;
      assessment.description = description || assessment.description;
      assessment.passMark = passMark || assessment.passMark;
      assessment.totalMark = totalMark || assessment.totalMark;
      assessment.duration = duration || assessment.duration;
      assessment.assessmentCode = assessmentCode || assessment.assessmentCode;

      if (questions) {
        assessment.questions = questions;
      }

      await assessment.save()

      return ResponseHandler.success(res, assessment, "Assessment updated successfully");
    } catch (error: any) {
      return ResponseHandler.failure(res, error.message);
    }
  }

  async submitTheoryAssessment(req: Request, res: Response) {
    try {
      const { assessmentId, learnerId, answers } = req.body;
  
      // Validate assessment existence
      const assessment = await TheoryAssessment.findById(assessmentId);
      if (!assessment) return ResponseHandler.failure(res, "Assessment not found", 404);
  
      const submission = await Submission.create({
        assessmentId,
        learnerId,
        answers,
      });
  
      return ResponseHandler.success(res, submission, "Submission created successfully");
    } catch (error: any) {
      return ResponseHandler.failure(res, error.message);
    }
  }
}


export default new TheoryAssessmentController();