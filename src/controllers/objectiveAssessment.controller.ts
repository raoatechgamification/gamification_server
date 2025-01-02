import { Request, Response } from "express";
import mongoose from "mongoose";
import * as XLSX from "xlsx";
import fileUpload from "express-fileupload";
import ObjectiveAssessment, {
  IObjectiveAssessment,
} from "../models/objectiveAssessment.model";
import QuestionsBank from "../models/questionsBank.model"
import Submission from "../models/submission.model";
import Course, { ICourse } from "../models/course.model";
import User from "../models/user.model";
import { ResponseHandler } from "../middlewares/responseHandler.middleware";

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
        saveToQuestionsBank, 
        questionsBankId,     
        groupId,             
        createNewGroup,      
        newGroupName,        
        questionsBankName   
      } = req.body;
  
      const organizationId = req.admin._id;
  
      // Validate questions
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
  
      // Determine position for the new assessment
      const lastAssessment = await ObjectiveAssessment.findOne().sort({
        position: -1,
      });
      const position = lastAssessment ? lastAssessment.position + 1 : 1;
  
      const code = assessmentCode || `EXT-${position}`;
  
      // Create new assessment
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
  
      if (saveToQuestionsBank) {
        let questionBank;
  
        // Check or create Questions Bank
        if (questionsBankId) {
          questionBank = await QuestionsBank.findOne({
            _id: questionsBankId,
            organizationId,
          });
  
          if (!questionBank) {
            return ResponseHandler.failure(
              res,
              "Questions Bank not found. Please provide a valid Questions Bank ID.",
              404
            );
          }
        } else if (questionsBankName) {
          questionBank = new QuestionsBank({
            name: questionsBankName,
            organizationId,
          });
  
          await questionBank.save();
        } else {
          return ResponseHandler.failure(
            res,
            "Questions Bank ID or name is required to save questions.",
            400
          );
        }
  
        // Handle group creation or addition
        if (createNewGroup) {
          if (!newGroupName) {
            return ResponseHandler.failure(
              res,
              "New group name is required to create a group.",
              400
            );
          }
  
          questionBank.groups.push({
            name: newGroupName,
            questions,
          });
        } else {
          const targetGroup = questionBank.groups.find(
            (group: { _id: string }) => group._id.toString() === groupId
          );
  
          if (!targetGroup) {
            return ResponseHandler.failure(
              res,
              `Group with ID "${groupId}" not found in the Questions Bank.`,
              404
            );
          }
  
          targetGroup.questions.push(...questions);
        }
  
        await questionBank.save();
      }
  
      return ResponseHandler.success(
        res,
        newAssessment,
        "Assessment created successfully",
        201
      );
    } catch (error: any) {
      console.error(error);
      return ResponseHandler.failure(
        res,
        error.message || "Error creating assessment",
        error.status || 500
      );
    }
  }  

  async createAssessmentUsingQuestionBank(req: Request, res: Response) {
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
        assessmentCode,
        groupId,
        questionIds, // Optional: Specific question IDs to use
        randomCount, // Optional: Number of questions to randomly select
      } = req.body;
  
      const organizationId = req.admin._id;
  
      // Validate required fields
      if (!groupId) {
        return ResponseHandler.failure(res, "Group ID is required.", 400);
      }
  
      if (!title || !description || !totalMark || !passMark || !duration) {
        return ResponseHandler.failure(res, "Required fields are missing.", 400);
      }
  
      // Find the specified group in the questions bank
      const questionBank = await QuestionsBank.findOne({
        "groups._id": groupId,
        organizationId,
      });
  
      if (!questionBank) {
        return ResponseHandler.failure(res, "Questions Bank or Group not found.", 404);
      }
  
      const group = questionBank.groups.find(
        (group: { _id: { toString: () => any; }; }) => group._id.toString() === groupId
      );
  
      if (!group) {
        return ResponseHandler.failure(res, "Group not found in the Questions Bank.", 404);
      }
  
      let selectedQuestions: typeof group.questions = [];
  
      if (questionIds && Array.isArray(questionIds)) {
        // Select questions by IDs
        selectedQuestions = group.questions.filter((q: { _id: { toString: () => any; }; }) =>
          questionIds.includes(q._id.toString())
        );
  
        if (selectedQuestions.length !== questionIds.length) {
          return ResponseHandler.failure(
            res,
            "Some question IDs provided do not exist in the group.",
            400
          );
        }
      } else if (randomCount) {
        // Randomly select questions
        if (randomCount > group.questions.length) {
          return ResponseHandler.failure(
            res,
            "Random count exceeds the number of questions in the group.",
            400
          );
        }
  
        const shuffledQuestions = group.questions.sort(() => 0.5 - Math.random());
        selectedQuestions = shuffledQuestions.slice(0, randomCount);
      } else {
        return ResponseHandler.failure(
          res,
          "Either 'questionIds' or 'randomCount' must be provided.",
          400
        );
      }
  
      // Calculate total marks if not provided
      const calculatedTotalMark = selectedQuestions.reduce(
        (sum: any, question: { mark: any; }) => sum + question.mark,
        0
      );
  
      const lastAssessment = await ObjectiveAssessment.findOne().sort({
        position: -1,
      });
      const position = lastAssessment ? lastAssessment.position + 1 : 1;
  
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
        totalMark: totalMark || calculatedTotalMark,
        duration,
        startDate,
        endDate,
        assessmentCode: code,
        questions: selectedQuestions.map((q: { question: any; type: any; options: any; answer: any; mark: any; }) => ({
          question: q.question,
          type: q.type,
          options: q.options,
          answer: q.answer,
          mark: q.mark,
        })),
        position,
      });
  
      await newAssessment.save();
  
      return ResponseHandler.success(
        res,
        newAssessment,
        "Assessment created successfully.",
        201
      );
    } catch (error: any) {
      console.error(error);
      return ResponseHandler.failure(
        res,
        error.message || "Error creating assessment.",
        error.status || 500
      );
    }
  }
  
  // async createObjectiveAssessment(req: Request, res: Response) {
  //   try {
  //     const {
  //       title,
  //       description,
  //       marksPerQuestion,
  //       numberOfTrials,
  //       purpose,
  //       passMark,
  //       totalMark,
  //       duration,
  //       startDate,
  //       endDate,
  //       questions,
  //       assessmentCode,
  //     } = req.body;

  //     const organizationId = req.admin._id;

  //     if (!Array.isArray(questions) || questions.length === 0) {
  //       return ResponseHandler.failure(res, "Questions are required.", 400);
  //     }

  //     const invalidQuestion = questions.find(
  //       (q: { question: string; mark?: number }) =>
  //         !q.question || (q.mark !== undefined && q.mark <= 0)
  //     );

  //     if (invalidQuestion) {
  //       return ResponseHandler.failure(
  //         res,
  //         'Each question must have a valid "question" field, and the "mark" field (if provided) must be positive.',
  //         400
  //       );
  //     }

  //     const lastAssessment = await ObjectiveAssessment.findOne().sort({
  //       position: -1,
  //     });
  //     const position = lastAssessment ? lastAssessment.position + 1 : 1;

  //     const code = assessmentCode || `EXT-${position}`;

  //     const newAssessment = new ObjectiveAssessment({
  //       organizationId,
  //       title,
  //       description,
  //       marksPerQuestion,
  //       numberOfTrials,
  //       purpose,
  //       passMark,
  //       totalMark,
  //       duration,
  //       startDate,
  //       endDate,
  //       assessmentCode: code,
  //       questions,
  //       position,
  //     });

  //     await newAssessment.save();

  //     return ResponseHandler.success(
  //       res,
  //       newAssessment,
  //       "Assessment created successfully",
  //       201
  //     );
  //   } catch (error: any) {
  //     return ResponseHandler.failure(
  //       res,
  //       error.message || "Error creating assessment",
  //       error.status || 500
  //     );
  //   }
  // }

  async bulkUploadQuestions(req: Request, res: Response) {
    try {
      const { questionsBankName, groupName } = req.body; 
      const organizationId = req.admin._id;
  
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded. Please provide an Excel file.',
        });
      }
  
      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheetData: any[] = XLSX.utils.sheet_to_json(
        workbook.Sheets[sheetName]
      );
  
      if (!Array.isArray(sheetData) || sheetData.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'The uploaded Excel file is empty or invalid.',
        });
      }
  
      const questions = sheetData.map((row, index) => {
        const { question, type, options, answer, mark } = row;
  
        if (!question || !type || !answer || !mark) {
          throw new Error(`Missing required fields in Excel row ${index + 1}.`);
        }
  
        return {
          question,
          type,
          options: options ? options.split(',') : [],
          answer,
          mark: Number(mark),
        };
      });
  
      // Check if a QuestionBank exists for the organization and name
      let questionBank = await QuestionsBank.findOne({
        organizationId,
        name: questionsBankName,
      });
  
      if (!questionBank) {
        // Create a new QuestionBank if it doesn't exist
        questionBank = new QuestionsBank({
          name: questionsBankName,
          organizationId,
          groups: [
            {
              name: groupName,
              questions,
            },
          ],
        });
      } else {
        // Add new questions to the specified group or create the group
        const targetGroup = questionBank.groups.find(
          (group: { name: any; }) => group.name === groupName
        );
  
        if (targetGroup) {
          targetGroup.questions.push(...questions);
        } else {
          questionBank.groups.push({
            name: groupName,
            questions,
          });
        }
      }
  
      await questionBank.save();
  
      return res.status(201).json({
        success: true,
        message: 'Questions uploaded successfully.',
        questionBank,
      });
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: error.message || 'An error occurred while uploading the questions.',
      });
    }
  }

  async uploadQuestionsManually(req: Request, res: Response) {
    try {
      const { questionsBankName, groupName, questions } = req.body;
      const organizationId = req.admin._id;

      // Validate and transform questions
      const validatedQuestions = questions.map((q: any, index: number) => {
        const { question, type, options, answer, mark } = q;

        if (!question || !type || !answer || mark === undefined) {
          throw new Error(`Missing required fields in question at index ${index + 1}.`);
        }

        return {
          question,
          type,
          options: options ? options : [],
          answer,
          mark: Number(mark),
        };
      });

      // Check if a QuestionBank exists for the organization and name
      let questionBank = await QuestionsBank.findOne({
        organizationId,
        name: questionsBankName,
      });

      if (!questionBank) {
        // Create a new QuestionBank if it doesn't exist
        questionBank = new QuestionsBank({
          name: questionsBankName,
          organizationId,
          groups: [
            {
              name: groupName,
              questions: validatedQuestions,
            },
          ],
        });
      } else {
        // Add new questions to the specified group or create the group
        const targetGroup = questionBank.groups.find(
          (group: { name: string }) => group.name === groupName
        );

        if (targetGroup) {
          targetGroup.questions.push(...validatedQuestions);
        } else {
          questionBank.groups.push({
            name: groupName,
            questions: validatedQuestions,
          });
        }
      }

      // Save the QuestionBank
      await questionBank.save();

      return res.status(201).json({
        success: true,
        message: 'Questions uploaded successfully.',
        questionBank,
      });
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: error.message || 'An error occurred while creating the assessment.',
      });
    }
  }

  // async bulkUploadAssessmentts(req: Request, res: Response) {
  //   try {
  //     const {
  //       title,
  //       description,
  //       marksPerQuestion,
  //       numberOfTrials,
  //       purpose,
  //       totalMark,
  //       passMark,
  //       duration,
  //       startDate,
  //       endDate,
  //       assessmentCode,
  //     } = req.body;

  //     const organizationId = req.admin._id
  
  //     if (!req.file) {
  //       return res.status(400).json({
  //         success: false,
  //         message: 'No file uploaded. Please provide an Excel file.',
  //       });
  //     }

  //     const lastAssessment = await ObjectiveAssessment.findOne()
  //     .sort({ position: -1 });
  //     const position = lastAssessment ? lastAssessment.position + 1 : 1;
  //     const code = assessmentCode || `EXT-${position}`;
  
  //     // Parse the uploaded Excel file
  //     const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
  //     const sheetName = workbook.SheetNames[0];
  //     const sheetData: any[] = XLSX.utils.sheet_to_json(
  //       workbook.Sheets[sheetName]
  //     );
  
  //     if (!Array.isArray(sheetData) || sheetData.length === 0) {
  //       return res.status(400).json({
  //         message: 'The uploaded Excel file is empty or invalid.',
  //       });
  //     }
  
  //     // Transform sheet data into questions
  //     const questions = sheetData.map((row, index) => {
  //       const { question, type, options, answer, mark } = row;
  
  //       if (!question || !type || !answer || !mark) {
  //         throw new Error(
  //           `Missing required fields in Excel row ${index + 1}.`
  //         );
  //       }
  
  //       return {
  //         question,
  //         type,
  //         options: options ? options.split(',') : [],
  //         answer,
  //         mark: Number(mark),
  //       };
  //     });
  
  //     const assessment = new ObjectiveAssessment({
  //       organizationId,
  //       title,
  //       description,
  //       marksPerQuestion: marksPerQuestion ? Number(marksPerQuestion) : undefined,
  //       numberOfTrials: numberOfTrials ? Number(numberOfTrials) : undefined,
  //       purpose,
  //       position, 
  //       totalMark: Number(totalMark),
  //       passMark: Number(passMark),
  //       duration: Number(duration),
  //       startDate: startDate ? new Date(startDate) : undefined,
  //       endDate: endDate ? new Date(endDate) : undefined,
  //       assessmentCode: code,
  //       questions,
  //     });
  
  //     await assessment.save();
  
  //     return res.status(201).json({
  //       message: 'Assessment uploaded successfully.',
  //       assessment,
  //     });
  //   } catch (error: any) {
  //     console.error(error);
  //     return res.status(500).json({
  //       message: error.message || 'An error occurred while uploading the assessment.',
  //     });
  //   }
  // }

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
      assessment.marksPerQuestion =
        marksPerQuestion || assessment.marksPerQuestion;
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

  // async takeAndGradeAssessmentt(req: Request, res: Response) {
  //   const { courseId, assessmentId } = req.params;
  //   const { answers } = req.body;
  //   const userId = req.user.id;

  //   try {
  //     const course = await Course.findById(courseId).populate("lessons");
  //     if (!course) {
  //       return ResponseHandler.failure(res, "Course not found", 404);
  //     }

  //     if (!course.lessons) {
  //       return ResponseHandler.failure(res, "No lessons found for this course", 404);
  //     }

  //     // Check if all lessons are completed
  //     const incompleteLessons = course.lessons.filter((lesson: any) => {
  //       const completionDetail = lesson.completionDetails?.find(
  //         (detail: any) => detail.userId.toString() === userId
  //       );
  //       return (completionDetail?.percentage || 0) < 100;
  //     });

  //     if (incompleteLessons.length > 0) {
  //       return ResponseHandler.failure(
  //         res,
  //         "You must complete all lessons in the course before submitting assessments",
  //         403
  //       );
  //     }

  //     const assessment = await ObjectiveAssessment.findById(assessmentId);
  //     if (!assessment) {
  //       return ResponseHandler.failure(res, "Assessment not found", 404);
  //     }

  //     // Check submission attempts scoped by course
  //     const submissionCount = await Submission.countDocuments({
  //       learnerId: userId,
  //       assessmentId,
  //       courseId,
  //     });

  //     if (submissionCount >= (assessment.numberOfTrials ?? Infinity)) {
  //       return ResponseHandler.failure(
  //         res,
  //         "You have exceeded the number of allowed attempts for this assessment in this course",
  //         403
  //       );
  //     }

  //     // Rest of the grading logic
  //     const questionIds = assessment.questions.map((q: { _id: { toString: () => any } }) =>
  //       q._id.toString()
  //     );
  //     const isValid = answers.every((answer: { questionId: { toString: () => any } }) =>
  //       questionIds.includes(answer.questionId.toString())
  //     );

  //     if (!isValid) {
  //       return ResponseHandler.failure(
  //         res,
  //         "Invalid question IDs or answers submitted",
  //         400
  //       );
  //     }

  //     let totalScore = 0;
  //     const gradedAnswers = answers.map((answer: { questionId: { toString: () => any }; answer: any }) => {
  //       const question = assessment.questions.find(
  //         (q: { _id: { toString: () => any } }) => q._id.toString() === answer.questionId.toString()
  //       );

  //       if (question) {
  //         const questionScore = question.mark ?? assessment.marksPerQuestion ?? 0;

  //         if (String(question.answer).toLowerCase() === String(answer.answer).toLowerCase()) {
  //           totalScore += questionScore;
  //           return { ...answer, isCorrect: true };
  //         }
  //       }
  //       return { ...answer, isCorrect: false };
  //     });

  //     const maxObtainableMarks = assessment.questions.reduce(
  //       (sum: any, q: { mark: any }) => sum + (q.mark ?? assessment.marksPerQuestion ?? 0),
  //       0
  //     );

  //     const percentageScore = Math.round((totalScore / maxObtainableMarks) * 100);
  //     const passOrFail = percentageScore >= assessment.passMark ? "Pass" : "Fail";

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
  //     });

  //     await Course.updateOne(
  //       { _id: courseId, "learnerIds.userId": userId },
  //       { $set: { "learnerIds.$.progress": 100 } }
  //     );

  //     const user = await User.findById(userId);
  //     if (!user) {
  //       return ResponseHandler.failure(res, "User not found", 404);
  //     }

  //     const ongoingProgram = user.ongoingPrograms?.find(
  //       (program) => (program.course as ICourse)._id?.toString() === courseId
  //     );

  //     if (ongoingProgram) {
  //       const isAlreadyCompleted = user.completedPrograms?.some(
  //         (program) => (program.course as ICourse)._id?.toString() === courseId
  //       );

  //       if (!isAlreadyCompleted) {
  //         const completedProgram = { ...ongoingProgram.course };
  //         delete completedProgram.assignedLearnersIds;
  //         delete completedProgram.learnerIds;

  //         // await User.updateOne(
  //         //   { _id: userId },
  //         //   {
  //         //     $set: {
  //         //       ongoingPrograms: { $ifNull: ["$ongoingPrograms", []] },
  //         //       completedPrograms: { $ifNull: ["$completedPrograms", []] },
  //         //       unattemptedPrograms: { $ifNull: ["$unattemptedPrograms", []] },
  //         //     },
  //         //   }
  //         // );

  //         await User.updateOne(
  //           { _id: userId },
  //           {
  //             $pull: { ongoingPrograms: { "course._id": courseId } },
  //             $push: { completedPrograms: { course: completedProgram } },
  //           }
  //         );
  //       }
  //     }

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

  async takeAndGradeAssessment(req: Request, res: Response) {
    const { courseId, assessmentId } = req.params;
    const { answers } = req.body;
    const userId = req.user.id;

    try {
      const course = await Course.findById(courseId).populate("lessons");
      if (!course) {
        return ResponseHandler.failure(res, "Course not found", 404);
      }

      if (!course.lessons) {
        return ResponseHandler.failure(
          res,
          "No lessons found for this course",
          404
        );
      }

      // Check if all lessons are completed
      const incompleteLessons = course.lessons.filter((lesson: any) => {
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

      const assessment = await ObjectiveAssessment.findById(assessmentId);
      if (!assessment) {
        return ResponseHandler.failure(res, "Assessment not found", 404);
      }

      // Check submission attempts scoped by course
      const submissionCount = await Submission.countDocuments({
        learnerId: userId,
        assessmentId,
        courseId,
      });

      const maxTrials = assessment.numberOfTrials ?? Infinity;
      const trialsLeft = Math.max(0, maxTrials - submissionCount) - 1;

      if (submissionCount >= maxTrials) {
        return ResponseHandler.failure(
          res,
          `You have exceeded the number of allowed attempts for this assessment in this course. Trials left: ${trialsLeft}`,
          403
        );
      }

      // Rest of the grading logic
      const questionIds = assessment.questions.map(
        (q: { _id: { toString: () => any } }) => q._id.toString()
      );
      const isValid = answers.every(
        (answer: { questionId: { toString: () => any } }) =>
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
      const gradedAnswers = answers.map(
        (answer: { questionId: { toString: () => any }; answer: any }) => {
          const question = assessment.questions.find(
            (q: { _id: { toString: () => any } }) =>
              q._id.toString() === answer.questionId.toString()
          );

          if (question) {
            const questionScore =
              question.mark ?? assessment.marksPerQuestion ?? 0;

            if (
              String(question.answer).toLowerCase() ===
              String(answer.answer).toLowerCase()
            ) {
              totalScore += questionScore;
              return { ...answer, isCorrect: true };
            }
          }
          return { ...answer, isCorrect: false };
        }
      );

      const maxObtainableMarks = assessment.questions.reduce(
        (sum: any, q: { mark: any }) =>
          sum + (q.mark ?? assessment.marksPerQuestion ?? 0),
        0
      );

      const percentageScore = Math.round(
        (totalScore / maxObtainableMarks) * 100
      );
      const passOrFail =
        percentageScore >= assessment.passMark ? "Pass" : "Fail";

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
      });

      await Course.updateOne(
        { _id: courseId, "learnerIds.userId": userId },
        { $set: { "learnerIds.$.progress": 100 } }
      );

      const user = await User.findById(userId);
      if (!user) {
        return ResponseHandler.failure(res, "User not found", 404);
      }

      const ongoingProgram = user.ongoingPrograms?.find(
        (program) => (program.course as ICourse)._id?.toString() === courseId
      );

      if (ongoingProgram) {
        const isAlreadyCompleted = user.completedPrograms?.some(
          (program) => (program.course as ICourse)._id?.toString() === courseId
        );

        if (!isAlreadyCompleted) {
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
        }
      }

      return ResponseHandler.success(
        res,
        {
          ...submission.toObject(),
          maxObtainableMarks,
          trialsLeft,
        },
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

      const assessment = await ObjectiveAssessment.findById(assessmentId);

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
      const userId = req.user.id;

      const submission = await Submission.findOne({
        _id: submissionId,
        learnerId: userId,
      });

      if (!submission) {
        return ResponseHandler.failure(res, "Submission not found");
      }

      const courseId = submission.courseId;

      const course = await Course.findById(courseId);
      const user = await User.findById(userId);

      let status = "Pass";
      if (submission.passOrFail == "Fail") status = "Retake";

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
      };

      return ResponseHandler.success(
        res,
        resultSlip,
        "Assessment result slip",
        200
      );
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
