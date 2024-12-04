import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { AssessmentController } from "../controllers/assessment.controller";
import { SubmissionController } from "../controllers/submission.controller";
import ObjectAssessmentController from "../controllers/objectiveAssessment.controller";
import {
  createAssessmentValidator,
  createObjectiveAssessmentValidator,
  submissionValidator,
  gradeAssessmentValidator,
  viewLearnersValidator,
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
  takeAssessment, 
  takeAndGradeAssessment,
  gradeObjectiveSubmission,
  getAssessmentById,
  getAllAssessmentsForOrganization
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

router.put(
  "/:submissionId/grade",
  authenticate,
  authorize("admin"),
  ...gradeAssessmentValidator,
  gradeSubmission
);

router.post(
  '/:assessmentId/submissions/:submissionId/grade',
  authenticate,
  authorize("admin"),
  gradeObjectiveSubmission
)

router.get(
  "/submissions/:assessmentId",
  authenticate,
  authorize("admin"),
  ...viewLearnersValidator,
  getSubmissionsForAssessment
);

router.post(
  "/:courseId/:assessmentId/take",
  authenticate,
  authorize("user"),
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
  "/",
  authenticate,
  authorize("admin"),
  getAllAssessmentsForOrganization
);

router.get(
  "/:assessmentId",
  authenticate,
  getAssessmentById
);

export default router;
