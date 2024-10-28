import express from "express";

const router = express.Router();
import authRoutes from "./auth.routes";
import superAdminRoutes from "./superAdmin.routes";
import assessmentRoutes from "./assessment.routes";
import courseRoutes from "./course.routes";
import groupRoutes from "./group.routes";
import userRoutes from "./user.routes";
import notificationRoutes from "./notification.routes";
import paymentRoutes from "./payment.routes";
import billRoutes from "./bill.routes";
import sessionRoutes from "./session.routes";

router.use("/auth", authRoutes);
router.use("/super-admin", superAdminRoutes);
router.use("/assessment", assessmentRoutes);
router.use("/course", courseRoutes);
router.use("/group", groupRoutes);
router.use("/user", userRoutes);
router.use("/notifications", notificationRoutes);
router.use("/payments", paymentRoutes);
router.use("/bill", billRoutes);
router.use("/session", sessionRoutes);

router.use("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to Gamification API V1",
  });
});

export default router;