import { Request, Response } from "express";
import ObjectiveAssessment from "../models/objectiveAssessment.model";
import Submission from "../models/submission.model";
import Course from "../models/course.model";
import { ResponseHandler } from "../middlewares/responseHandler.middleware";
import { AssessmentInterface, AssessmentQuestionInterface } from "../models/objectiveAssessment.model"

class ObjectAssessmentController {
  async createObjectiveAssessment(req: Request, res: Response) {
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

      const organizationId = req.admin._id
  
      // Validate questions
      if (!Array.isArray(questions) || questions.length === 0) {
        return ResponseHandler.failure(res, 'Questions are required.', 400);
      }
  
      const invalidQuestion = questions.find(
        (q: { question: string; mark?: number }) =>
          !q.question || (q.mark !== undefined && q.mark <= 0)
      );
  
      if (invalidQuestion) {
        return ResponseHandler.failure(
          res,
          'Each question must have a valid "question" field, and the "mark" field (if provided) must be positive.',
          400
        );
      }
  
      // Determine position
      const lastAssessment = await ObjectiveAssessment.findOne().sort({ position: -1 });
      const position = lastAssessment ? lastAssessment.position + 1 : 1;
  
      // Generate assessmentCode if not provided
      const code = assessmentCode || `EXT-${position}`;
  
      // Create the assessment
      const newAssessment = new ObjectiveAssessment({
        organizationId,
        title,
        description,
        marksPerQuestion,
        numberOfTrials,
        purpose,
        passMark,
        duration,
        startDate,
        endDate,
        assessmentCode: code,
        questions,
        position,
      });
  
      await newAssessment.save();
  
      return ResponseHandler.success(
        res,
        newAssessment,
        'Assessment created successfully',
        201
      );
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        error.message || 'Error creating assessment',
        error.status || 500
      );
    }
  }

  async takeAssessment(req: Request, res: Response) {
    const { assessmentId } = req.params;
    const { answers }: { answers: { questionId: string; answer: string }[] } = req.body;
    const userId = req.user.id;
  
    try {
      const assessment = await ObjectiveAssessment.findById(assessmentId);
      if (!assessment) {
        return ResponseHandler.failure(res, "Assessment not found", 404);
      }
  
      // Get the course for the assessment
      const course = await Course.findById(assessment.courseId);
      if (!course) {
        return ResponseHandler.failure(res, "Course not found", 404);
      }
  
      // Check if the user is enrolled and their progress
      const learner = course.learnerIds?.find(
        (learner) => learner.userId.toString() === userId?.toString()
      );
      if (!learner) {
        return ResponseHandler.failure(res, "You are not enrolled in this course", 403);
      }
      if (learner.progress < 90) {
        return ResponseHandler.failure(res, "You must complete at least 90% of the course to take this assessment", 403);
      }
  
      // Validate answers
      const questionIds = assessment.questions.map((q: AssessmentQuestionInterface) => q._id.toString());
      const isValid = answers.every((answer) => questionIds.includes(answer.questionId));
  
      if (!isValid) {
        return ResponseHandler.failure(res, "Invalid answers submitted", 400);
      }
  
      const submission = await Submission.create({
        learnerId: userId,
        assessmentId,
        answer: answers,
        status: "Submitted",
      });
  
      return ResponseHandler.success(res, submission, "Assessment submitted successfully", 201);
    } catch (error: any) {
      return ResponseHandler.failure(res, error.message || "Error submitting assessment", error.status || 500);
    }
  }

  async gradeObjectiveSubmission(req: Request, res: Response) {
    const { assessmentId, submissionId } = req.params;
    const organizationId = req.admin._id
  
    try {
      // Fetch the assessment
      const assessment = await ObjectiveAssessment.findOne({
        _id: assessmentId,
        organizationId
      });
      if (!assessment) {
        return ResponseHandler.failure(res, "Assessment not found", 404);
      }
  
      // Ensure questions is an array
      if (!Array.isArray(assessment.questions)) {
        return ResponseHandler.failure(res, "Assessment questions are invalid", 400);
      }
  
      // Fetch the submission
      const submission = await Submission.findById(submissionId);
      if (!submission) {
        return ResponseHandler.failure(res, "Submission not found", 404);
      }
  
      // Ensure submission.answer is an array
      if (!Array.isArray(submission.answer)) {
        return ResponseHandler.failure(res, "Submission answers are invalid", 400);
      }
  
      let totalScore = 0;
  
      // Grade the answers
      const gradedAnswers = submission.answer.map(
        (answer: { questionId: string; answer: string }) => {
          const question = assessment.questions.find(
            (q: AssessmentQuestionInterface) => q._id.toString() === answer.questionId
          );
  
          if (question) {
            const questionScore = question.mark ?? assessment.marksPerQuestion ?? 0;
            if (question.answer === answer.answer) {
              totalScore += questionScore; // Add score for correct answer
              return { ...answer, isCorrect: true };
            }
          }
  
          return { ...answer, isCorrect: false };
        }
      );
  
      // Update the submission with grades
      submission.score = totalScore;
      submission.status = "Graded";
      submission.gradedAnswers = gradedAnswers;
      await submission.save();
  
      return ResponseHandler.success(
        res,
        submission,
        "Submission graded successfully"
      );
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        error.message || "Error grading submission",
        error.status || 500
      );
    }
  }
  
  
  // async gradeObjectiveSubmission(req: Request, res: Response) {
  //   const { assessmentId, submissionId } = req.params;
  
  //   try {
  //     // Find the assessment
  //     const assessment = await ObjectiveAssessment.findById(assessmentId);
  //     if (!assessment) {
  //       return ResponseHandler.failure(res, 'Assessment not found', 404);
  //     }

  //     if (!Array.isArray(assessment.questions)) {
  //       return ResponseHandler.failure(res, "Assessment questions are invalid", 400);
  //     }
  
  //     // Find the submission
  //     const submission = await Submission.findById(submissionId);
  //     if (!submission) {
  //       return ResponseHandler.failure(res, 'Submission not found', 404);
  //     }
  
  //     // Grade the submission
  //     let totalScore = 0;
  //     const gradedAnswers = submission.answer.map(
  //       (answer: { questionId: string; answer: string }) => {
  //         const question = assessment.questions.find(
  //           (q) => q._id.toString() === answer.questionId
  //         );
  
  //         if (question) {
  //           const questionScore = question.mark ?? assessment.marksPerQuestion; // Use question mark if provided
  //           if (question.answer === answer.answer) {
  //             totalScore += questionScore; // Add score for correct answer
  //             return { ...answer, isCorrect: true };
  //           }
  //         }
  
  //         return { ...answer, isCorrect: false };
  //       }
  //     );
  
  //     // Update the submission with grades
  //     submission.score = totalScore;
  //     submission.status = 'Graded';
  //     submission.gradedAnswers = gradedAnswers;
  //     await submission.save();
  
  //     return ResponseHandler.success(
  //       res,
  //       submission,
  //       'Submission graded successfully'
  //     );
  //   } catch (error: any) {
  //     return ResponseHandler.failure(
  //       res,
  //       error.message || 'Error grading submission',
  //       error.status || 500
  //     );
  //   }
  // }
}

export default new ObjectAssessmentController();
