import { Request, Response } from "express";
import mongoose from "mongoose";
import ObjectiveAssessment from "../models/objectiveAssessment.model";
import Submission from "../models/submission.model";
import Course, { ICourse } from "../models/course.model";
import User from "../models/user.model"
import { ResponseHandler } from "../middlewares/responseHandler.middleware";
import {
  AssessmentInterface,
  AssessmentQuestionInterface,
} from "../models/objectiveAssessment.model";

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
        totalMark,
        duration,
        startDate,
        endDate,
        questions,
        assessmentCode,
      } = req.body;

      const organizationId = req.admin._id;

      if (!Array.isArray(questions) || questions.length === 0) {
        return ResponseHandler.failure(res, "Questions are required.", 400);
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

      const lastAssessment = await ObjectiveAssessment.findOne().sort({
        position: -1,
      });
      const position = lastAssessment ? lastAssessment.position + 1 : 1;

      const code = assessmentCode || `EXT-${position}`;

      
      const newAssessment = new ObjectiveAssessment({
        organizationId,
        title,
        description,
        marksPerQuestion,
        numberOfTrials,
        purpose,
        passMark,
        totalMark,
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
        "Assessment created successfully",
        201
      );
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        error.message || "Error creating assessment",
        error.status || 500
      );
    }
  }

  async editObjectiveAssessment(req: Request, res: Response) {
    try {
      const { assessmentId } = req.params; 
      const {
        title,
        description,
        marksPerQuestion,
        numberOfTrials,
        purpose,
        passMark,
        totalMark,
        duration,
        startDate,
        endDate,
        questions,
        assessmentCode,
      } = req.body;
  
      const organizationId = req.admin._id; 
  
      const assessment = await ObjectiveAssessment.findOne({
        _id: assessmentId,
        organizationId,
      });
  
      if (!assessment) {
        return ResponseHandler.failure(res, "Assessment not found.", 404);
      }
  
      // Update the assessment details
      assessment.title = title || assessment.title;
      assessment.description = description || assessment.description;
      assessment.marksPerQuestion = marksPerQuestion || assessment.marksPerQuestion;
      assessment.numberOfTrials = numberOfTrials || assessment.numberOfTrials;
      assessment.purpose = purpose || assessment.purpose;
      assessment.passMark = passMark || assessment.passMark;
      assessment.totalMark = totalMark || assessment.totalMark;
      assessment.duration = duration || assessment.duration;
      assessment.startDate = startDate || assessment.startDate;
      assessment.endDate = endDate || assessment.endDate;
      assessment.assessmentCode = assessmentCode || assessment.assessmentCode;
  
      // Replace questions if provided
      if (questions) {
        assessment.questions = questions;
      }
  
      // Save updated assessment
      await assessment.save();
  
      return ResponseHandler.success(
        res,
        assessment,
        "Assessment updated successfully.",
        200
      );
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        error.message || "Error updating assessment.",
        error.status || 500
      );
    }
  }

  async takeAndGradeAssessment(req: Request, res: Response) {
    const { courseId, assessmentId } = req.params;
    const {
      answers,
    }: {
      answers: { questionId: string; answer: string | boolean | number }[];
    } = req.body;
    const userId = req.user.id;
  
    try {
      const course = await Course.findById(courseId).populate("lessons");
      if (!course) {
        return ResponseHandler.failure(res, "Course not found", 404);
      }
  
      // Check if all lessons are completed
      const lessons = course.lessons || [];
      const incompleteLessons = lessons.filter((lesson: any) => {
        const completionDetail = lesson.completionDetails?.find(
          (detail: any) => detail.userId.toString() === userId
        );
        return (completionDetail?.percentage || 0) < 100;
      });
  
      if (incompleteLessons.length > 0) {
        return ResponseHandler.failure(
          res,
          "You must complete all lessons in the course before submitting assessments",
          403
        );
      }
  
      // Convert assessmentId to ObjectId
      const assessmentObjectId = new mongoose.Types.ObjectId(assessmentId);
  
      if (!course.assessments?.includes(assessmentObjectId)) {
        return ResponseHandler.failure(
          res,
          "This assessment does not belong to the specified course",
          403
        );
      }
  
      const assessment = await ObjectiveAssessment.findById(assessmentId);
      if (!assessment) {
        return ResponseHandler.failure(res, "Assessment not found", 404);
      }
  
      const submissionCount = await Submission.countDocuments({
        learnerId: userId,
        assessmentId,
      });
      if (submissionCount >= (assessment.numberOfTrials ?? Infinity)) {
        return ResponseHandler.failure(
          res,
          "You have exceeded the number of allowed attempts for this assessment",
          403
        );
      }
  
      const questionIds = assessment.questions.map((q: { _id: { toString: () => any } }) =>
        q._id.toString()
      );
      const isValid = answers.every((answer) =>
        questionIds.includes(answer.questionId.toString())
      );
      if (!isValid) {
        return ResponseHandler.failure(
          res,
          "Invalid question IDs or answers submitted",
          400
        );
      }
  
      let totalScore = 0;
      const gradedAnswers = answers.map((answer) => {
        const question = assessment.questions.find(
          (q: { _id: { toString: () => string } }) =>
            q._id.toString() === answer.questionId.toString()
        );
  
        if (question) {
          const questionScore = question.mark ?? assessment.marksPerQuestion ?? 0;
  
          if (
            String(question.answer).toLowerCase() ===
            String(answer.answer).toLowerCase()
          ) {
            totalScore += questionScore;
            return { ...answer, isCorrect: true };
          }
        }
        return { ...answer, isCorrect: false };
      });
  
      const maxObtainableMarks = assessment.questions.reduce(
        (sum: any, q: { mark: any }) =>
          sum + (q.mark ?? assessment.marksPerQuestion ?? 0),
        0
      );
  
      const percentageScore = Math.round((totalScore / maxObtainableMarks) * 100);
      const passOrFail = percentageScore >= assessment.passMark ? "Pass" : "Fail";
  
      const certificateId = course.certificate;
  
      if (certificateId && passOrFail === "Pass") {
        const user = await User.findOne({
          _id: userId,
          certificates: { $elemMatch: { certificateId } },
        });
  
        if (!user) {
          const updateResult = await User.updateOne(
            { _id: userId },
            {
              $addToSet: {
                certificates: {
                  courseId: courseId as unknown as mongoose.Types.ObjectId,
                  courseName: course.title,
                  certificateId,
                },
              },
            }
          );
  
          if (updateResult.modifiedCount === 0) {
            console.log("Failed to add certificate or user not found.");
          } else {
            console.log("Certificate added to user's records.");
          }
        }
      }
  
      const submission = await Submission.create({
        learnerId: userId,
        courseId,
        assessmentId,
        answer: answers,
        gradedAnswers,
        score: totalScore,
        percentageScore,
        status: "Graded",
        passOrFail,
        maxObtainableMarks,
      });
  
      // Update course progress to 100% and move the course to completedCourses
      const updated = await Course.updateOne(
        { _id: courseId, "learnerIds.userId": userId },
        { $set: { "learnerIds.$.progress": 100 } }
      );

      console.log("Control got here 1:", updated)
  
      const user = await User.findById(userId);
      if (!user) {
        return ResponseHandler.failure(res, "User not found", 404);
      }

      // const ongoingProgram = user.ongoingPrograms?.find(
      //   (program) => program._id?.toString() === courseId
      // );

      const ongoingProgram = user.ongoingPrograms?.find(
        (program) => (program.course as ICourse)._id?.toString() === courseId
      );

      if (!ongoingProgram) {
        return ResponseHandler.failure(
          res,
          "Course is not in the unattempted programs list",
          400
        );
      }

      const completedProgram = { ...ongoingProgram.course };
      delete completedProgram.assignedLearnersIds;
      delete completedProgram.learnerIds;

      await User.updateOne(
        { _id: userId },
        {
          $pull: { ongoingPrograms: { "course._id": courseId } },
          $push: { completedPrograms: { course: completedProgram } },
        }
      );
      
      // await User.updateOne(
      //   { _id: userId },
      //   {
      //     $pull: { ongoingPrograms: { "_id": courseId } },
      //     $push: { completedPrograms: ongoingProgram },
      //   }
      // );

      console.log("Control got here 2")

      return ResponseHandler.success(
        res,
        { ...submission.toObject(), maxObtainableMarks },
        "Assessment submitted and graded successfully",
        201
      );
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        error.message || "Error processing assessment",
        error.status || 500
      );
    }
  }
   

  // async takeAndGradeAssessment(req: Request, res: Response) {
  //   const { courseId, assessmentId } = req.params;
  //   const {
  //     answers,
  //   }: {
  //     answers: { questionId: string; answer: string | boolean | number }[];
  //   } = req.body;
  //   const userId = req.user.id;
  
  //   try {
  //     const course = await Course.findById(courseId);
  //     if (!course) {
  //       return ResponseHandler.failure(res, "Course not found", 404);
  //     }
  
  //     // Convert assessmentId to ObjectId
  //     const assessmentObjectId = new mongoose.Types.ObjectId(assessmentId);
  
  //     if (!course.assessments?.includes(assessmentObjectId)) {
  //       return ResponseHandler.failure(
  //         res,
  //         "This assessment does not belong to the specified course",
  //         403
  //       );
  //     }
  
  //     const assessment = await ObjectiveAssessment.findById(assessmentId);
  //     if (!assessment) {
  //       return ResponseHandler.failure(res, "Assessment not found", 404);
  //     }
  
  //     const submissionCount = await Submission.countDocuments({
  //       learnerId: userId,
  //       assessmentId,
  //     });
  //     if (submissionCount >= (assessment.numberOfTrials ?? Infinity)) {
  //       return ResponseHandler.failure(
  //         res,
  //         "You have exceeded the number of allowed attempts for this assessment",
  //         403
  //       );
  //     }
  
  //     const questionIds = assessment.questions.map((q: { _id: { toString: () => any; }; }) => q._id.toString());
  //     const isValid = answers.every((answer) =>
  //       questionIds.includes(answer.questionId.toString())
  //     );
  //     if (!isValid) {
  //       return ResponseHandler.failure(res, "Invalid question IDs or answers submitted", 400);
  //     }
  
  //     let totalScore = 0;
  //     const gradedAnswers = answers.map((answer) => {
  //       const question = assessment.questions.find(
  //         (q: { _id: { toString: () => string; }; }) => q._id.toString() === answer.questionId.toString()
  //       );
  
  //       if (question) {
  //         const questionScore = question.mark ?? assessment.marksPerQuestion ?? 0;
  
  //         if (
  //           String(question.answer).toLowerCase() ===
  //           String(answer.answer).toLowerCase()
  //         ) {
  //           totalScore += questionScore;
  //           return { ...answer, isCorrect: true };
  //         }
  //       }
  //       return { ...answer, isCorrect: false };
  //     });
  
  //     const maxObtainableMarks = assessment.questions.reduce(
  //       (sum: any, q: { mark: any; }) => sum + (q.mark ?? assessment.marksPerQuestion ?? 0),
  //       0
  //     );
  
  //     const percentageScore = Math.round((totalScore / maxObtainableMarks) * 100);
  //     const passOrFail = percentageScore >= assessment.passMark ? "Pass" : "Fail";

  //     const certificateId = course.certificate;

  //     if (certificateId && passOrFail === "Pass") {
  //       const user = await User.findOne({
  //         _id: userId,
  //         certificates: { $elemMatch: { certificateId } }, 
  //       });

  //       if (!user) {
  //         const updateResult = await User.updateOne(
  //           { _id: userId },
  //           {
  //             $addToSet: {
  //               certificates: {
  //                 courseId: courseId as unknown as mongoose.Types.ObjectId,
  //                 courseName: course.title,
  //                 certificateId,
  //               },
  //             },
  //           }
  //         );
    
  //         if (updateResult.modifiedCount === 0) {
  //           console.log("Failed to add certificate or user not found.");
  //         } else {
  //           console.log("Certificate added to user's records.");
  //         }
  //       }        
  //     }
        
  //     const submission = await Submission.create({
  //       learnerId: userId,
  //       courseId,
  //       assessmentId,
  //       answer: answers,
  //       gradedAnswers,
  //       score: totalScore,
  //       percentageScore,
  //       status: "Graded",
  //       passOrFail,
  //       maxObtainableMarks, 
  //     });
  
  //     return ResponseHandler.success(
  //       res,
  //       { ...submission.toObject(), maxObtainableMarks }, 
  //       "Assessment submitted and graded successfully",
  //       201
  //     );
  //   } catch (error: any) {
  //     return ResponseHandler.failure(
  //       res,
  //       error.message || "Error processing assessment",
  //       error.status || 500
  //     );
  //   }
  // }

  async getAllAssessmentsForOrganization(req: Request, res: Response) {
    const organizationId = req.admin._id;

    try {
      const assessments = await ObjectiveAssessment.find({ organizationId });

      if (!assessments.length) {
        return ResponseHandler.failure(
          res,
          "No assessments found for this organization",
          404
        );
      }

      return ResponseHandler.success(
        res,
        assessments,
        "Assessments retrieved successfully"
      );
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        error.message || "Error retrieving assessments",
        error.status || 500
      );
    }
  }

  async getAssessmentById(req: Request, res: Response) {
    try {
      const { assessmentId } = req.params;
      // console.log("Assessment ID:", assessmentId)
      // const organizationId = req.admin._id;

      // console.log("Organization ID:", organizationId)

      // const assessment = await ObjectiveAssessment.findOne({
      //   _id: assessmentId,
      //   organizationId,
      // });

      const assessment = await ObjectiveAssessment.findById(assessmentId)

      if (!assessment) {
        return ResponseHandler.failure(res, "Assessment not found", 404);
      }

      return ResponseHandler.success(
        res,
        assessment,
        "Assessment retrieved successfully"
      );
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        error.message || "Error retrieving assessment",
        error.status || 500
      );
    }
  }

  async assessmentResultSlip(req: Request, res: Response) {
    try {
      const { submissionId } = req.params;
      const userId = req.user.id

      const submission = await Submission.findOne({
        _id: submissionId,
        learnerId: userId
      })

      if (!submission) {
        return ResponseHandler.failure(
          res,
          "Submission not found",
        )
      }

      const courseId = submission.courseId

      const course = await Course.findById(courseId);
      const user = await User.findById(userId);

      let status = "Pass";
      if (submission.passOrFail == "Fail") status = "Retake"

      const formatDate = (date: Date) => {
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      };

      const resultSlip = {
        courseTitle: course?.title,
        courseCode: course?.courseCode,
        firstName: user?.firstName,
        lastName: user?.lastName,
        userId: user?.userId || null,
        totalMarksObtained: submission.score,
        totalObtainableMarks: submission.maxObtainableMarks,
        percentageOfTotalObtainableMarks: submission.percentageScore,
        status,
        picture: user?.image,
        resultGeneratedOn: formatDate(new Date()),
      }

      return ResponseHandler.success(
        res, 
        resultSlip,
        "Assessment result slip",
        200
      )
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        error.message || "Error processing assessment slip",
        error.status || 500
      );
    }
  }
}

export default new ObjectAssessmentController();
