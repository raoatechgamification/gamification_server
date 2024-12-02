import { Request, Response } from 'express';
import ObjectiveAssessment from '../models/objectiveAssessment.model';
import Submission from "../models/submission.model";
import { ResponseHandler } from '../middlewares/responseHandler.middleware';

class ObjectAssessmentController {
  async createObjectiveAssessment(req: Request, res: Response)  {
    try {
      const {
        title,
        description,
        marksPerQuestion,
        numberOfTrials,
        purpose,
        passMark,
        duration,
        startDate,
        endDate,
        questions,
        assessmentCode,
      } = req.body;
  
      // Validate required fields
      // if (!title || !description || !marksPerQuestion || !passMark || !duration || !questions) {
      //   throw new CustomError('Missing required fields', 400);
      // }
  
      // Determine position
      const lastAssessment = await ObjectiveAssessment.findOne().sort({ position: -1 });
      const position = lastAssessment ? lastAssessment.position + 1 : 1;
  
      // Generate assessmentCode if not provided
      const code = assessmentCode || `EXT-${position}`;
  
      // Create the assessment
      const newAssessment = new ObjectiveAssessment({
        assessmentCode: code,
        title,
        description,
        marksPerQuestion,
        numberOfTrials,
        purpose,
        position,
        passMark,
        duration,
        startDate,
        endDate,
        questions,
      });
  
      await newAssessment.save();
  
      return ResponseHandler.success(
        res, 
        newAssessment, 
        'Assessment created successfully'
      );
    } catch (error: any) {
      return ResponseHandler.failure(
        res, 
        error.message || 'Error creating assessment', 
        error.status || 500
      );
    }
  }

  async submitAssessment(req: Request, res: Response) {
    const { assessmentId } = req.params;
    const { answers } = req.body;
    const userId = req.user.id

    try {
      const assessment = await ObjectiveAssessment.findById(assessmentId);
      if (!assessment) {
        return ResponseHandler.failure(res, "Assessment not found", 404);
      }

      // Validate answers
      const questionIds = assessment.questions.map((q: { _id: { toString: () => any; }; }) => q._id.toString());
      const isValid = answers.every((answer: { questionId: string; answer: string }) =>
        questionIds.includes(answer.questionId)
      );

      if (!isValid) {
        return ResponseHandler.failure(res, "Invalid answers submitted", 400);
      }

      const submission = await Submission.create({
        learnerId: userId,
        assessmentId,
        answerText: answers,
        status: 'Submitted', 
      });

      return ResponseHandler.success(
        res, 
        submission, 
        'Assessment submitted successfully', 
        201
      );
    } catch (error: any) {
      return ResponseHandler.failure(
        res, 
        error.message || 'Error submitting assessment', 
        error.status || 500
      );
    }
  }
}

export default new ObjectAssessmentController();