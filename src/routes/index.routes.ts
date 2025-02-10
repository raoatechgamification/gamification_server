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
import adminRoutes from "./admin.routes";
import certificateRoutes from "./certificate.routes";
import permissionRoutes from "./permissions.routes";
import roleRoutes from "./role.routes";
import LandingPageRoute from "./landingpage.routes";
import bookingRoutes from "./booking.routes";

router.use("/auth", authRoutes);
router.use("/super-admin", superAdminRoutes);
router.use("/admin", adminRoutes);
router.use("/assessment", assessmentRoutes);
router.use("/course", courseRoutes);
router.use("/groups", groupRoutes);
router.use("/user", userRoutes);
router.use("/notifications", notificationRoutes);
router.use("/payments", paymentRoutes);
router.use("/bill", billRoutes);
router.use("/session", sessionRoutes);
router.use("/certificates", certificateRoutes);
router.use("/landing-page", LandingPageRoute);
router.use("/permissions", permissionRoutes);
router.use("/roles", roleRoutes);
router.use("/bookings", bookingRoutes);

router.use("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to Gamification API V1",
  });
});

export default router;
