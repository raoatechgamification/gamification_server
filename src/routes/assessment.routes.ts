import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { AssessmentController } from "../controllers/assessment.controller";
import { SubmissionController } from "../controllers/submission.controller";
import ObjectAssessmentController from "../controllers/objectiveAssessment.controller";
import {
  createAssessmentValidator,
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

const { createObjectiveAssessment } = ObjectAssessmentController;

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
  createObjectiveAssessment
)

router.put(
  "/grade/:submissionId",
  authenticate,
  authorize("admin"),
  ...gradeAssessmentValidator,
  gradeSubmission
);

router.get(
  "/submissions/:assessmentId",
  authenticate,
  authorize("admin"),
  ...viewLearnersValidator,
  getSubmissionsForAssessment
);

router.post(
  "/submit/:assessmentId",
  authenticate,
  authorize("user"),
  upload.single("file"),
  ...submissionValidator,
  submitAssessment
);

export default router;
