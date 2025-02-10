import { Request, Response } from "express";
import { ResponseHandler } from "../middlewares/responseHandler.middleware"
import { scheduleMeeting } from "../services/googleCalender.service"
import Booking from "../models/booking.model"


class BookingController {
  async createMeeting(req: Request, res: Response) {
    try {
      const { title, description, startTime, endTime, attendees } = req.body;
  
      const eventDetails = {
        summary: title,
        description,
        startTime,
        endTime,
        attendees,
      };
  
      const booking = await scheduleMeeting(eventDetails);
  
      const newBooking = new Booking({
        title,
        description,
        startTime,
        endTime,
        attendees,
        meetLink: booking.hangoutLink,
        organizer: req.user.email, // Assuming `req.user` contains authenticated user info
      });
  
      await newBooking.save();
  
      ResponseHandler.success(res, newBooking, 'Booking created successfully');
    } catch (error: any) {
      ResponseHandler.failure(res, error.message, 500);
    }
  }
}

export default new BookingController();