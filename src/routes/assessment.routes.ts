import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { AssessmentController } from "../controllers/assessment.controller";
import { SubmissionController } from "../controllers/submission.controller";
import ObjectAssessmentController from "../controllers/objectiveAssessment.controller";
import { uploadMiddleware } from "../services/questionBank.service"
import {
  createAssessmentValidator,
  createObjectiveAssessmentValidator,
  validateBulkUploadRequest,
  submissionValidator,
  gradeAssessmentValidator,
  assessmentIdValidator,
  submissionIdValidator,
  submissionIdsValidator
} from "../validators/assessment.validator";

import { upload } from "../utils/upload.utils";

const router = Router();

const {
  createAssessment: createAssessmentHandler,
  getSubmissionsForAssessment,
  gradeSubmission,
} = new AssessmentController();

const { 
  createObjectiveAssessment, 
  bulkUploadAssessments,
  editObjectiveAssessment,
  takeAndGradeAssessment,
  getAssessmentById,
  getAllAssessmentsForOrganization,
  assessmentResultSlip
} = ObjectAssessmentController;

const { submitAssessment } = new SubmissionController();

router.post(
  "/create",
  authenticate,
  authorize("admin"),
  upload.single("file"),
  ...createAssessmentValidator,
  createAssessmentHandler
);

router.post(
  '/objective',
  authenticate,
  authorize("admin"),
  ...createObjectiveAssessmentValidator,
  createObjectiveAssessment
)

router.post(
  "/bulk-upload",
  authenticate,
  authorize("admin"),
  // uploadMiddleware,
  ...validateBulkUploadRequest,
  bulkUploadAssessments
)

// router.post(
//   "/question-bank/upload",
//   authenticate,
//   authorize("admin"),
//   uploadMiddleware,
//   uploadQuestionBank
// )

router.put(
  "/:assessmentId",
  authenticate,
  authorize("admin"),
  ...assessmentIdValidator,
  ...createObjectiveAssessmentValidator,
  editObjectiveAssessment
)

router.put(
  "/:submissionId/grade",
  authenticate,
  authorize("admin"),
  ...gradeAssessmentValidator,
  gradeSubmission
);

router.get(
  "/submissions/:assessmentId",
  authenticate,
  authorize("admin"),
  ...assessmentIdValidator,
  getSubmissionsForAssessment
);

router.post(
  "/:courseId/:assessmentId/take",
  authenticate,
  authorize("user"),
  ...submissionIdsValidator,
  takeAndGradeAssessment
)

router.post(
  "/submit/:assessmentId",
  authenticate,
  authorize("user"),
  upload.single("file"),
  ...submissionValidator,
  submitAssessment
);

router.get(
  "/result-slip/:submissionId",
  authenticate,
  authorize("user"),
  ...submissionIdValidator,
  assessmentResultSlip
)

router.get(
  "/",
  authenticate,
  authorize("admin"),
  getAllAssessmentsForOrganization
);

router.get(
  "/:assessmentId",
  authenticate,
  ...assessmentIdValidator,
  getAssessmentById
);

export default router;
