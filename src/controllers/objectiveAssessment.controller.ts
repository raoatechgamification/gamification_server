import { Request, Response } from 'express';
import Assessment from '../models/objectiveAssessment.model';
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
      const lastAssessment = await Assessment.findOne().sort({ position: -1 });
      const position = lastAssessment ? lastAssessment.position + 1 : 1;
  
      // Generate assessmentCode if not provided
      const code = assessmentCode || `EXT-${position}`;
  
      // Create the assessment
      const newAssessment = new Assessment({
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
}

export default new ObjectAssessmentController();