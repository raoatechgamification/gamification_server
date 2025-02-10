import { Request, Response } from "express";
import { ResponseHandler } from "../middlewares/responseHandler.middleware";
import { scheduleMeeting } from "../services/googleCalendar.service";
import { getTokens } from "../config/googleAuth.config";
import Booking from "../models/booking.model";
import User from "../models/user.model";

class BookingController {
  async oauth2Callback(req: Request, res: Response) {
    try {
      const code = req.query.code as string;
      const tokens = await getTokens(code);

      console.log("Tokens: ", tokens);

      res.status(200).json({
        success: true,
        message: "Authentication successful",
        tokens,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "OAuth2 callback failed",
      });
    }
  }

  async createBooking(req: Request, res: Response) {
    try {
      const {
        title,
        description,
        startDate,
        endDate,
        timeZone,
        frequency,
        participants,
        reminder,
      } = req.body;

      const organizationId = req.admin._id;

      const users = await User.find({ _id: { $in: participants } });
      const emails = users.map((user) => user.email);

      const eventDetails = {
        summary: title,
        description,
        startTime: startDate,
        endTime: endDate,
        attendees: emails.map((email) => ({ email })),
        timeZone,
      };

      const bookingResponse = await scheduleMeeting(eventDetails);

      const newBooking = await Booking.create({
        title,
        description,
        startDate,
        endDate,
        timeZone,
        frequency,
        participants,
        organizationId,
        calendarEventId: bookingResponse.id,
        conferenceData: bookingResponse,
        reminder,
      });

      return ResponseHandler.success(
        res,
        newBooking,
        "Booking created successfully"
      );
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        error.message || "An error occurred while creating your booking",
        error.status || 500
      );
    }
  }

  async confirmAvailability(req: Request, res: Response) {
    try {
      const { startDate, endDate, participants } = req.body;

      const conflicts = await Booking.find({
        $or: [{ startDate: { $lt: endDate }, endDate: { $gt: startDate } }],
        participants: { $in: participants },
      }).populate("participants", "firstName lastName");

      if (conflicts.length > 0) {
        const unavailableUsers = conflicts
          .map((conflict) =>
            conflict.participants.map(
              (user: any) => `${user.firstName} ${user.lastName}`
            )
          )
          .flat();

        return ResponseHandler.failure(res, "Some users are unavailable", 400, {
          unavailableUsers,
        });
      }

      return ResponseHandler.success(
        res,
        null,
        "All participants are available for this time slot"
      );
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        error.message || "An error occurred while confirming availability",
        error.status || 500
      );
    }
  }
}

export default new BookingController();
