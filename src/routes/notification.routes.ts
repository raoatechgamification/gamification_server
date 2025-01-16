import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";

import { NotificationController } from "../controllers/notification.controller";
import {
  createNotificationValidator,
  markAsReadValidator,
} from "../validators/notification.validator";

const { createNotification, getNotifications, markAsRead } =
  new NotificationController();

const router = Router();

router.get("/", authenticate, authorize(["user"]), getNotifications);

router.post(
  "/",
  authenticate,
  authorize(["admin"]),
  ...createNotificationValidator,
  createNotification
);

router.patch(
  "/:notificationId/read",
  authenticate,
  authorize(["user"]),
  ...markAsReadValidator,
  markAsRead
);

export default router;
