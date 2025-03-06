import { Router } from "express";
import bookingController from "../controllers/booking.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const {
  oauth2Callback,
  createBooking,
  confirmAvailability,
  getAllBookings,
  getOneBooking,
  editBooking,
  deleteBooking,
  availabilityPercentage,
  createMeeting,
} = bookingController;

const router = Router();

router.post("/schedule", authenticate, authorize(["admin"]), createBooking);
router.get("/schedule", authenticate, authorize(["admin"]), getAllBookings);
// router.get("/user/schedule", authenticate, authorize(["user"]), getAllBookings);

router.get("/schedule/:id", authenticate, authorize(["admin"]), getOneBooking);
router.put("/schedule/:id", authenticate, authorize(["admin"]), editBooking);
router.delete(
  "/schedule/:id",
  authenticate,
  authorize(["admin"]),
  deleteBooking
);
router.post(
  "/check-availability",
  authenticate,
  authorize(["admin"]),
  confirmAvailability
);
router.post(
  "/availability-percentage",
  authenticate,
  authorize(["admin"]),
  availabilityPercentage
);

router.get("/auth/google", (req, res) => {
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&response_type=code&scope=https://www.googleapis.com/auth/calendar.events`;
  console.log("Google Auth URL: ", googleAuthUrl);
  res.redirect(googleAuthUrl);
});

router.get("/oauth2callback", oauth2Callback);
router.post("/generate-meeting", createMeeting);

export default router;
