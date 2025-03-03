import { Request, Response } from "express";
import { getTokens } from "../config/googleAuth.config";
import { ResponseHandler } from "../middlewares/responseHandler.middleware";
import Booking from "../models/booking.model";
import Organization from "../models/organization.model";
import SubAdmin from "../models/subadmin.model";
import User from "../models/user.model";
import {
  getTextMessageInput,
  sendBookingNotification,
  sendMessage,
} from "../services/sendMail.service";

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
        time,
        endTime,
        endDate,
        timeZone,
        frequency,
        participants,
        reminder,
        courseId,
      } = req.body;

      const organizationId = req.admin._id;
      const organization = await Organization.findById(organizationId);
      console.log(organization, "organization");
      const users = await User.find({ _id: { $in: participants } });
      const subAdmins = await SubAdmin.find({ _id: { $in: participants } });

      // const emails = userDetails.map((user) => user.email);
      // const subAdminEmails = subAdminDetails.map(subAdmin => subAdmin.email);
      // const firstNames = [...userDetails, ...subAdminDetails].map(person => person.firstName);

      // const allEmails = [...emails, ...subAdminEmails];

      // Remove any potential duplicates (in case a user appears in both collections)
      // const uniqueEmails = [...new Set(allEmails)];

      // const eventDetails = {
      //   summary: title,
      //   description,
      //   startTime: startDate,
      //   endTime: endDate,

      //   attendees: emails.map((email) => ({ email })),
      //   timeZone,
      //    courseId,
      // };

      // const bookingResponse = await scheduleMeeting(eventDetails);

      const newBooking = await Booking.create({
        title,
        description,
        startDate,
        endDate,
        timeZone,
        frequency,
        participants,
        organizationId,
        // calendarEventId: bookingResponse.id,
        // conferenceData: bookingResponse,
        reminder,
        courseId,
        time,
        endTime,
      });

      await User.updateMany(
        { _id: { $in: users } },
        { $push: { userBookings: newBooking._id } }
      );

      if (reminder === "email") {
        console.log("email reminder");
        const userDetails = [
          ...users.map((user) => ({
            email: user.email,
            firstName: user.firstName,
          })),
          ...subAdmins.map((subAdmin) => ({
            email: subAdmin.email,
            firstName: subAdmin.firstName,
          })),
        ];

        console.log(userDetails, "userdetails");
        for (const user of userDetails) {
          const emailVariables = {
            email: user.email,
            name: user.firstName,
            bookingName: newBooking.title,
            organizationName: organization?.name || "Raoatech",
            subject: "Booking Notification",
          };
          await sendBookingNotification(emailVariables);
        }
      }

      if (reminder === "whatsapp") {
        var data = getTextMessageInput(
          "2349056983150",
          "Welcome to the Movie Ticket Demo App for Node.js!"
        );

        sendMessage(data)
          .then(function (response) {
            console.log(response.data, 622);
            // res.redirect("/");
            // res.sendStatus(200);
            // return;
          })
          .catch(function (error) {
            // console.log(error);
            console.log(error.response.data);
            // res.sendStatus(500);
            // return;
          });
      }
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

  async getAllBookings(req: Request, res: Response) {
    try {
      const organizationId = req.admin._id;
      const bookings = await Booking.find({ organizationId: organizationId })
        .populate("courseId")
        .populate("participants");

      return ResponseHandler.success(
        res,
        bookings,
        "Bookings retrieved successfully"
      );
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        error.message || "Failed to retrieve bookings",
        error.status || 500
      );
    }
  }

  async getOneBooking(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const booking = await Booking.findById(id)
        .populate("courseId")
        .populate("participants");

      if (!booking) {
        return ResponseHandler.failure(res, "Booking not found", 404);
      }

      return ResponseHandler.success(
        res,
        booking,
        "Booking retrieved successfully"
      );
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        error.message || "Failed to retrieve booking",
        error.status || 500
      );
    }
  }

  async editBooking(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const updatedBooking = await Booking.findByIdAndUpdate(id, updateData, {
        new: true,
      });

      if (!updatedBooking) {
        return ResponseHandler.failure(
          res,
          "Booking not found or update failed",
          404
        );
      }

      return ResponseHandler.success(
        res,
        updatedBooking,
        "Booking updated successfully"
      );
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        error.message || "Failed to update booking",
        error.status || 500
      );
    }
  }
  // Delete booking
  async deleteBooking(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deletedBooking = await Booking.findByIdAndDelete(id);

      if (!deletedBooking) {
        return ResponseHandler.failure(
          res,
          "Booking not found or already deleted",
          404
        );
      }

      return ResponseHandler.success(res, null, "Booking deleted successfully");
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        error.message || "Failed to delete booking",
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

  async availabilityPercentage(req: Request, res: Response) {
    try {
      const { startDate, endDate, participants } = req.body;

      // Find conflicts where the booking overlaps and participants are involved
      const conflicts = await Booking.find({
        $or: [{ startDate: { $lt: endDate }, endDate: { $gt: startDate } }],
        participants: { $in: participants },
      }).populate("participants", "firstName lastName _id");

      // Extract unavailable user IDs
      const unavailableUserIds = new Set(
        conflicts.flatMap((conflict) =>
          conflict.participants.map((user: any) => user._id.toString())
        )
      );

      // Separate available and unavailable participants
      const unavailableUsers = participants.filter((id: string) =>
        unavailableUserIds.has(id)
      );
      const availableUsers = participants.filter(
        (id: string) => !unavailableUserIds.has(id)
      );

      // Calculate percentage available
      const totalParticipants = participants.length;
      const availablePercentage = (
        (availableUsers.length / totalParticipants) *
        100
      ).toFixed(2);

      return ResponseHandler.success(
        res,
        {
          availablePercentage,
          availableUsers,
          unavailableUsers,
        },
        "Availability check completed"
      );
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        error.message || "An error occurred while confirming availability",
        error.status || 500
      );
    }
  }

  async getUserBookings(req: Request, res: Response) {
    try {
      const userId = req.user.id;

      const user = await User.findById(userId).populate("userBookings");
      console.log(user);
      return ResponseHandler.success(
        res,
        user?.userBookings,
        "User bookings retrieved successfully"
      );
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        error.message || "An error occurred while retrieving user bookings",
        error.status || 500
      );
    }
  }
}

export default new BookingController();
