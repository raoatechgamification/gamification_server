import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import SessionController from "../controllers/session.controller";

import { createOrEditSessionValidator, sessionIdValidator } from "../validators/session.validator";

const {
  createSession, 
  editSession,
  viewASession, 
  viewAllSessions, 
  deleteSession
} = SessionController

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("admin"),
  ...createOrEditSessionValidator,
  createSession
);

router.put(
  "/edit/:sessionId",
  authenticate,
  authorize("admin"),
  ...createOrEditSessionValidator,
  editSession
);

router.get(
  "/:sessionId", 
  authenticate, 
  ...sessionIdValidator,
  viewASession
);

router.get(
  "/",
  authenticate, 
  authorize("admin"), 
  viewAllSessions
);

router.delete(
  "/:sessionId",
  authenticate, 
  authorize("admin"),
  ...sessionIdValidator,
  deleteSession
)

export default router;