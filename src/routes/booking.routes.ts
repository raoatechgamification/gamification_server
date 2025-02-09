import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import bookingController from "../controllers/booking.controller";

const {
  oauth2Callback,
  createBooking,
  confirmAvailability
} = bookingController

const router = Router();

router.post(
  "/schedule",
  authenticate,
  authorize(["admin"]),
  createBooking
)

router.post(
  "/check-availability",
  authenticate,
  authorize(["admin"]),
  confirmAvailability
)

router.get("/auth/google", (req, res) => {
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&response_type=code&scope=https://www.googleapis.com/auth/calendar.events`;
  console.log("Google Auth URL: ", googleAuthUrl)
  res.redirect(googleAuthUrl);
});

router.get(
  "/oauth2callback",
  oauth2Callback
)

export default router;