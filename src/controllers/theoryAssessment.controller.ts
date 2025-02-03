import { Request, Response } from "express";
import mongoose from "mongoose"
import TheoryAssessment from "../models/theoryAssessment.model";
import TheorySubmission from "../models/theorySubmission.model";
import { ResponseHandler } from "../middlewares/responseHandler.middleware"
import User from "../models/user.model";
import Submission from "../models/submission.model";
import Course, { ICourse } from "../models/course.model";
import { getOrganizationId } from "../utils/getOrganizationId.util";
import Organization from "../models/organization.model";
import { uploadToCloudinary } from "../utils/cloudinaryUpload"


class TheoryAssessmentController {
  async createTheoryAssessment(req: Request, res: Response) {
    try {
      const {
        title,
        description,
        totalMark,
        passMark,
        duration,
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
      
      let questions = JSON.parse(req.body.questions);
      if (!Array.isArray(questions)) {
        return ResponseHandler.failure(res, "Invalid questions format", 400);
      }
  
      if (req.files) {
        for (const file of req.files as Express.Multer.File[]) {
          const questionIndex = parseInt(file.fieldname.replace("questionFile", ""));
          if (!isNaN(questionIndex) && questions[questionIndex]) {
            try {
              const result = await uploadToCloudinary(
                file.buffer, 
                file.mimetype, 
                "theory_assessments"
              );
              questions[questionIndex].file = result.secure_url;
              console.log("File uploaded successfully:", result.secure_url);
            } catch (uploadError) {
              console.error("Error uploading file:", uploadError);
              return ResponseHandler.failure(res, "File upload failed", 500, uploadError);
            }
          }
        }
      }

      const lastAssessment = await TheoryAssessment.findOne().sort({
        position: -1,
      });
      const position = lastAssessment ? lastAssessment.position + 1 : 1;

      const code = assessmentCode || `EXT-${position}`;
      
      const newAssessment = await TheoryAssessment.create({
        organizationId,
        title,
        description,
        position,
        totalMark,
        passMark,
        duration,
        assessmentCode: code,
        questions,
      });
  
      return ResponseHandler.success(res, newAssessment, "Theory assessment created successfully", 201 );
    } catch (error: any) {
      return ResponseHandler.failure(res, "Error creating theory assessment", 500, error);
    }
  }
  
  async editTheoryAssessment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateFields = { ...req.body };
      let questions = JSON.parse(req.body.questions);
  
      if (!Array.isArray(questions)) {
        return ResponseHandler.failure(res, "Invalid questions format", 400);
      }
      
      console.log("A")
      if (req.files) {
        for (const [index, file] of Object.entries(req.files)) {
          const questionIndex = parseInt(index.replace("questionFile", ""));
          if (!isNaN(questionIndex) && questions[questionIndex]) {
            const result = await uploadToCloudinary(
              file[0].buffer,
              file[0].mimetype,
              "theory_assessments"
            );
            questions[questionIndex].file = result.secure_url;
          }
        }
      }

      console.log("B")
  
      updateFields.questions = questions;
  
      const updatedAssessment = await TheoryAssessment.findByIdAndUpdate(id, updateFields, { new: true });
      if (!updatedAssessment) {
        return ResponseHandler.failure(res, "Theory assessment not found", 404);
      }

      console.log("C")
  
      return ResponseHandler.success(res, updatedAssessment.$assertPopulated, "Theory assessment updated successfully", 200);
    } catch (error: any) {
      console.log(error)
      return ResponseHandler.failure(res, "Error updating theory assessment", 500, error);
    }
  }

  async submitTheoryAssessment(req: Request, res: Response) {
    try {
      const { assessmentId, courseId } = req.params;
      const { answers } = req.body;
      const userId = req.user.id

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
  
      // Validate assessment existence
      const assessment = await TheoryAssessment.findById(assessmentId);
      if (!assessment) return ResponseHandler.failure(res, "Assessment not found", 404);
  
      const submission = await Submission.create({
        learnerId: userId,
        courseId,
        assessmentId,
        answer: answers,
      });
  
      return ResponseHandler.success(res, submission, "Submission created successfully");
    } catch (error: any) {
      return ResponseHandler.failure(res, error.message);
    }
  }

  async gradeTheoryAssessment(req: Request, res: Response) {
    try {
      const { comments, score, } = req.body;

      let organizationId = await getOrganizationId(req, res);
      if (!organizationId) {
        return;
      }

      const organization = await Organization.findById(organizationId);
      if (!organization) {
        return ResponseHandler.failure(res, "Organization not found", 400);
      }

      // Destructure submission id, assessment id and courseId from req.params
      const { submissionId } = req.params;

      // Get submission to confirm it exists
      const submission = await Submission.findOne({
        _id: submissionId,
        organizationId
      })

      if (!submission) {
        return ResponseHandler.failure(res, "Submission not found")
      }
      const assessmentId = submission.assessmentId
      const userId = submission.learnerId
      const assessment = await TheoryAssessment.findById(assessmentId)

      if (!assessment) {
        return ResponseHandler.failure(res, "Assessment not found")
      }

      const maxObtainableMarks = assessment.totalMark;
      const percentageScore = Math.round(
        (score / (assessment.totalMark)) * 100
      );
      const passOrFail =
        percentageScore >= assessment.passMark ? "Pass" : "Fail";

      // Grade submisision 
      await submission.updateOne(
        { _id: submissionId }, 
        {
          $set: {
            comments,
            score,
            maxObtainableMarks,
            passOrFail,
            percentageScore,
            status: "Graded",
          }
        }
      )

      const course = await Course.findById(submission.courseId)
      if (!course) return ResponseHandler.failure(res, "Course not found")

      const courseId = course._id
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
          delete completedProgram.assignedLearnerIds;
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
          // trialsLeft: trialsLeft - 1,
        },
        "Assessment submitted and graded successfully",
        201
      );
    } catch (error: any) {
      return ResponseHandler.failure(res, error.message);
    }
  }

  async getSubmission(req: Request, res: Response) {
    try {
      let organizationId = await getOrganizationId(req, res);
      if (!organizationId) {
        return;
      }

      const organization = await Organization.findById(organizationId);
      if (!organization) {
        return ResponseHandler.failure(res, "Organization not found", 400);
      }

      const { submissionId, assessmentId } = req.params

      const submission = await Submission.findOne({
        _id: submissionId,
        
      }).populate("theoryAssessments")

      // Fetch user's subsmission with the submission id, and populate it with the assessment 

      // return the assessment
    } catch (error: any) {
      return ResponseHandler.failure(res, error.message);
    }
  }
}


export default new TheoryAssessmentController();