import { Request, Response, NextFunction, Router } from "express";
import { authenticate, authorize, checkSubadminPermission } from "../middlewares/auth.middleware";
// import { AssessmentController } from "../controllers/assessment.controller";
import { SubmissionController } from "../controllers/submission.controller";
import ObjectAssessmentController from "../controllers/objectiveAssessment.controller";
import TheoryAssessmentController from "../controllers/theoryAssessment.controller";

import {
  createAssessmentValidator,
  createObjectiveAssessmentValidator,
  validateBulkUploadRequest,
  validateManualQuestionsUpload,
  submissionValidator,
  gradeAssessmentValidator,
  assessmentIdValidator,
  submissionIdValidator,
  submissionIdsValidator,
  validateObjectiveAssessmentUsingQuestionsBank
} from "../validators/assessment.validator";

import { upload } from "../utils/upload.utils";

const router = Router();

const {
  createObjectiveAssessment,
  createObjectiveAssessmentFromQuestionsBank,
  bulkUploadQuestions,
  uploadQuestionsManually,
  editObjectiveAssessment,
  takeAndGradeAssessment,
  getAssessmentById,
  getAllAssessmentsForAnOrganization,
  assessmentResultSlipByAdmin,
  assessmentResultSlip,
} = ObjectAssessmentController;

const {
  createTheoryAssessment,
  editTheoryAssessment,
  submitTheoryAssessment
} = TheoryAssessmentController;

router.post(
  "/theory",
  authenticate,
  authorize(["admin", "subAdmin"]),
  checkSubadminPermission("Assessment Management", "Create Theory Assessment"),
  upload.any(),
  // ...createAssessmentValidator,
  createTheoryAssessment
);

router.post(
  "/objective",
  authenticate,
  authorize(["admin", "subAdmin"]),
  checkSubadminPermission("Assessment Management", "Create Objective Assessment"),
  ...createObjectiveAssessmentValidator,
  createObjectiveAssessment
);

router.post(
  "/objective/from-question-bank",
  authenticate,
  authorize(["admin", "subAdmin"]),
  checkSubadminPermission("Assessment Management", "Create Objective Assessment"),
  ...validateObjectiveAssessmentUsingQuestionsBank,
  createObjectiveAssessmentFromQuestionsBank
);

router.post(
  "/questions/bulk-upload",
  authenticate,
  checkSubadminPermission("Assessment Management", "Create Questions"),
  authorize(["admin", "subAdmin"]),
  ...validateBulkUploadRequest,
  bulkUploadQuestions
);

router.post(
  "/questions/manual-upload",
  authenticate,
  authorize(["admin", "subAdmin"]),
  checkSubadminPermission("Assessment Management", "Create Questions"),
  ...validateManualQuestionsUpload,
  uploadQuestionsManually
);

router.put(
  "/:assessmentId",
  authenticate,
  authorize(["admin", "subAdmin"]),
  checkSubadminPermission("Assessment Management", "Edit Assessment"),
  ...assessmentIdValidator,
  ...createObjectiveAssessmentValidator,
  editObjectiveAssessment
);

router.put(
  "/theory/:id",
  authenticate,
  authorize(["admin", "subAdmin"]),
  checkSubadminPermission("Assessment Management", "Edit Assessment"),
  upload.any(),
  editTheoryAssessment
)

router.post(
  "/:courseId/:assessmentId/take",
  authenticate,
  authorize(["user"]),
  ...submissionIdsValidator,
  takeAndGradeAssessment
);

router.get(
  "/result-slip/:submissionId",
  authenticate,
  authorize(["user"]),
  ...submissionIdValidator,
  assessmentResultSlip
);

router.get(
  "/results",
  authenticate,
  authorize(["admin", "subAdmin"]),
  assessmentResultSlipByAdmin
);

router.get(
  "/",
  authenticate,
  authorize(["admin", "subAdmin", "user", "superAdmin"]),
  checkSubadminPermission("Assessment Management", "View Assessment"),
  getAllAssessmentsForAnOrganization
);

router.get(
  "/:assessmentId",
  authenticate,
  authorize(["admin", "subAdmin", "user", "superAdmin"]),
  ...assessmentIdValidator,
  checkSubadminPermission("Assessment", "View Assessment"),
  getAssessmentById
);

router.post(
  "/theory/:courseId/:assessmentId",
  authenticate,
  authorize(["user"]),
  upload.any(),
  submitTheoryAssessment
)

export default router;
