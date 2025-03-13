import { Request, Response } from "express";
// import { getTokens } from "../config/googleAuth.config";
import { v4 as uuidv4 } from "uuid";
import { getTokens } from "../config/googleAuth.config";

import fs from "fs"; // To load local files
import path from "path";
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
import generate from "../utils/JitsiJWT";

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

  // async createBooking(req: Request, res: Response) {
  //   try {
  //     const {
  //       title,
  //       description,
  //       startDate,
  //       time,
  //       endTime,
  //       endDate,
  //       timeZone,
  //       frequency,
  //       participants,
  //       reminder,
  //       courseId,
  //       reminderTime,
  //     } = req.body;

  //     const organizationId = req.admin._id;
  //     const organization = await Organization.findById(organizationId);
  //     console.log(organization, "organization");
  //     const users = await User.find({ _id: { $in: participants } });
  //     const subAdmins = await SubAdmin.find({ _id: { $in: participants } });
  //     const userDetails = [
  //       ...users.map((user) => ({
  //         email: user.email,
  //         firstName: user.firstName,
  //       })),
  //       ...subAdmins.map((subAdmin) => ({
  //         email: subAdmin.email,
  //         firstName: subAdmin.firstName,
  //       })),
  //     ];
  //     const allParticipantIds = [
  //       ...users.map((user) => user._id),
  //       ...subAdmins.map((subAdmin) => subAdmin._id),
  //     ];
  //     console.log(allParticipantIds, "allpart");
  //     const emails = userDetails.map((user) => user.email);
  //     // const subAdminEmails = subAdminDetails.map(subAdmin => subAdmin.email);
  //     // const firstNames = [...userDetails, ...subAdminDetails].map(person => person.firstName);

  //     // const allEmails = [...emails, ...subAdminEmails];

  //     // Remove any potential duplicates (in case a user appears in both collections)
  //     // const uniqueEmails = [...new Set(allEmails)];

  //     // const oauth2Client = getOAuthClient(req.admin._id);
  //     // const eventDetails = {
  //     //   summary: title,
  //     //   description,
  //     //   startTime: startDate,
  //     //   endTime: endDate,

  //     //   attendees: emails.map((email) => ({ email })),
  //     //   timeZone,
  //     //   courseId,
  //     // };

  //     // const bookingResponse = await scheduleMeeting(
  //     //   eventDetails,
  //     //   organizationId
  //     // );

  //     const newBooking = await Booking.create({
  //       title,
  //       description,
  //       startDate,
  //       endDate,
  //       timeZone,
  //       frequency,
  //       participants: allParticipantIds,
  //       organizationId,
  //       // calendarEventId: bookingResponse.id,
  //       // conferenceData: bookingResponse,
  //       reminder,
  //       courseId,
  //       time,
  //       endTime,
  //       reminderTime,
  //     });

  //     await User.updateMany(
  //       { _id: { $in: users } },
  //       { $push: { userBookings: newBooking._id } }
  //     );
  //     await SubAdmin.updateMany(
  //       { _id: { $in: subAdmins } },
  //       { $push: { userBookings: newBooking._id } }
  //     );
  //     if (reminder === "email") {
  //       console.log("email reminder");

  //       console.log(userDetails, "userdetails");
  //       for (const user of userDetails) {
  //         const emailVariables = {
  //           email: user.email,
  //           name: user.firstName,
  //           bookingName: newBooking.title,
  //           organizationName: organization?.name || "Raoatech",
  //           subject: "Booking Notification",
  //         };
  //         await sendBookingNotification(emailVariables);
  //       }
  //     }

  //     if (reminder === "whatsapp") {
  //       var data = getTextMessageInput(
  //         "2349056983150",
  //         "Welcome to the Movie Ticket Demo App for Node.js!"
  //       );

  //       sendMessage(data)
  //         .then(function (response) {
  //           console.log(response.data, 622);
  //           // res.redirect("/");
  //           // res.sendStatus(200);
  //           // return;
  //         })
  //         .catch(function (error) {
  //           // console.log(error);
  //           console.log(error.response.data);
  //           // res.sendStatus(500);
  //           // return;
  //         });
  //     }
  //     return ResponseHandler.success(
  //       res,
  //       newBooking,
  //       "Booking created successfully"
  //     );
  //   } catch (error: any) {
  //     return ResponseHandler.failure(
  //       res,
  //       error.message || "An error occurred while creating your booking",
  //       error.status || 500
  //     );
  //   }
  // }

  async getAllBookings(req: Request, res: Response) {
    try {
      const organizationId = req.admin._id;
      const bookings = await Booking.find({ organizationId: organizationId })
        .populate("courseId")
        .populate("participants")
        .sort({ createdAt: -1 }); // Sort by creation date in descending order

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

  async createMeeting(req: Request, res: Response) {
    try {
      // if (req.method !== "POST") {
      //   return res
      //     .status(405)
      //     .json({ message: `Method ${req.method} Not Allowed` });
      // }

      // Generate a unique meeting ID
      const meetingId = uuidv4();

      // In a real-world scenario, you'd:
      // 1. Check user authentication
      // 2. Store meeting details in the database
      // 3. Implement access controls

      return ResponseHandler.success(
        res,
        { meetingId, meetingLink: `/meeting/${meetingId}?creator=true` },
        "Meeting created successfully.",
        201
      );
    } catch (error: any) {
      console.error("Error creating meeting:", error);
      return ResponseHandler.failure(
        res,
        error.message || "An error occurred while creating the meeting.",
        error.status || 500
      );
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
        reminderTime,
      } = req.body;

      const organizationId = req.admin._id;
      const organization = await Organization.findById(organizationId);

      const users = await User.find({ _id: { $in: participants } });
      const subAdmins = await SubAdmin.find({ _id: { $in: participants } });
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
      const allParticipantIds = [
        ...users.map((user) => user._id),
        ...subAdmins.map((subAdmin) => subAdmin._id),
      ];

      const emails = userDetails.map((user) => user.email);

      // Generate unique meeting ID and password for Jitsi
      const meetingId = uuidv4();
      const meetingPassword = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();

      // Create meeting link
      // Base URL should be your domain where Jitsi is integrated
      const baseUrl = process.env.APP_URL || "https://your-app-domain.com";
      const meetingLink = `${baseUrl}/meeting/${meetingId}?creator=true`;

      // Store conference data
      const conferenceData = {
        provider: "jitsi",
        meetingId,
        password: meetingPassword,
        joinUrl: meetingLink,
      };

      const newBooking = await Booking.create({
        title,
        description,
        startDate,
        endDate,
        timeZone,
        frequency,
        participants: allParticipantIds,
        organizationId,
        reminder,
        courseId,
        time,
        endTime,
        reminderTime,
        // Jitsi integration fields
        meetingId,
        meetingLink,
        meetingPassword,
        meetingStatus: "scheduled",
        conferenceData,
      });

      await User.updateMany(
        { _id: { $in: users } },
        { $push: { userBookings: newBooking._id } }
      );
      await SubAdmin.updateMany(
        { _id: { $in: subAdmins } },
        { $push: { userBookings: newBooking._id } }
      );

      if (reminder === "email") {
        console.log("email reminder");

        console.log(userDetails, "userdetails");
        for (const user of userDetails) {
          const emailVariables = {
            email: user.email,
            name: user.firstName,
            bookingName: newBooking.title,
            organizationName: organization?.name || "Raoatech",
            subject: "Booking Notification",
            meetingLink: meetingLink,
            meetingTime: `${new Date(startDate).toLocaleDateString()} ${time}`,
            meetingPassword: meetingPassword,
          };
          await sendBookingNotification(emailVariables);
        }
      }

      if (reminder === "whatsapp") {
        // Assuming you have a whatsapp message template for meetings
        const messageTemplate = `You have been invited to a meeting: ${newBooking.title}
        Date: ${new Date(startDate).toLocaleDateString()}
        Time: ${time}
        Join link: ${meetingLink}
        Password: ${meetingPassword}`;

        // Using your existing whatsapp service
        var data = getTextMessageInput(
          "2349056983150", // This should be dynamic based on participant's number
          messageTemplate
        );

        sendMessage(data)
          .then(function (response) {
            console.log(response.data, 622);
          })
          .catch(function (error) {
            console.log(error.response.data);
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

  // async createBooking(req: Request, res: Response) {
  //   try {
  //     const {
  //       title,
  //       description,
  //       startDate,
  //       time,
  //       endTime,
  //       endDate,
  //       timeZone,
  //       frequency,
  //       participants,
  //       reminder,
  //       courseId,
  //       reminderTime,
  //       isRecorded = true, // Default to recording the session
  //     } = req.body;

  //     const organizationId = req.admin._id;
  //     const organization = await Organization.findById(organizationId);

  //     const users = await User.find({ _id: { $in: participants } });
  //     const subAdmins = await SubAdmin.find({ _id: { $in: participants } });
  //     const userDetails = [
  //       ...users.map((user) => ({
  //         email: user.email,
  //         firstName: user.firstName,
  //         model: "User",
  //       })),
  //       ...subAdmins.map((subAdmin) => ({
  //         email: subAdmin.email,
  //         firstName: subAdmin.firstName,
  //         model: "SubAdmin",
  //       })),
  //     ];
  //     const allParticipantIds = [
  //       ...users.map((user) => user._id),
  //       ...subAdmins.map((subAdmin) => subAdmin._id),
  //     ];

  //     const emails = userDetails.map((user) => user.email);

  //     // Generate a unique room name for the Jitsi conference
  //     const roomName = `${title.replace(/\s+/g, "-")}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  //     // Create conference data
  //     const conferenceData = {
  //       roomName,
  //       appId:
  //         process.env.JITSI_APP_ID ||
  //         "vpaas-magic-cookie-e2c62d128f394864a5c13e8fc9f9bc0c",
  //       isRecorded,
  //       status: "scheduled",
  //     };

  //     const newBooking = await Booking.create({
  //       title,
  //       description,
  //       startDate,
  //       endDate,
  //       timeZone,
  //       frequency,
  //       participants: allParticipantIds,
  //       participantModel:
  //         userDetails.length > 0 ? userDetails[0].model : "User", // Default to User if no participants
  //       organizationId,
  //       conferenceData,
  //       reminder,
  //       courseId,
  //       time,
  //       endTime,
  //       reminderTime,
  //     });

  //     await User.updateMany(
  //       { _id: { $in: users.map((u) => u._id) } },
  //       { $push: { userBookings: newBooking._id } }
  //     );
  //     await SubAdmin.updateMany(
  //       { _id: { $in: subAdmins.map((s) => s._id) } },
  //       { $push: { userBookings: newBooking._id } }
  //     );

  //     if (reminder === "email") {
  //       console.log("email reminder");

  //       console.log(userDetails, "userdetails");
  //       for (const user of userDetails) {
  //         const emailVariables = {
  //           email: user.email,
  //           name: user.firstName,
  //           bookingName: newBooking.title,
  //           organizationName: organization?.name || "Raoatech",
  //           subject: "Booking Notification",
  //           conferenceLink: `${process.env.FRONTEND_URL}/conference/${newBooking._id}`,
  //           startTime: `${new Date(startDate).toLocaleDateString()} ${time}`,
  //           endTime: `${new Date(endDate).toLocaleDateString()} ${endTime}`,
  //         };
  //         await sendBookingNotification(emailVariables);
  //       }
  //     }

  //     if (reminder === "whatsapp") {
  //       // Your existing WhatsApp logic
  //       var data = getTextMessageInput(
  //         "2349056983150",
  //         `New booking: ${title}. Join at ${process.env.FRONTEND_URL}/conference/${newBooking._id}`
  //       );

  //       sendMessage(data)
  //         .then(function (response) {
  //           console.log(response.data, 622);
  //         })
  //         .catch(function (error) {
  //           console.log(error.response.data);
  //         });
  //     }

  //     return ResponseHandler.success(
  //       res,
  //       newBooking,
  //       "Booking created successfully"
  //     );
  //   } catch (error: any) {
  //     return ResponseHandler.failure(
  //       res,
  //       error.message || "An error occurred while creating your booking",
  //       error.status || 500
  //     );
  //   }
  // }

  // Add this new method to handle joining a conference
  async joinConference(req: Request, res: Response) {
    try {
      const { bookingId } = req.params;
      const userId = req.user?._id || req.admin?._id;

      // Find the booking
      const booking = await Booking.findById(bookingId);

      if (!booking) {
        return ResponseHandler.failure(res, "Booking not found", 404);
      }

      // Check if the user is authorized to join
      const isParticipant = booking.participants.some(
        (p) => p.toString() === userId.toString()
      );
      const isOrganizer =
        booking.organizationId.toString() === userId.toString();

      if (!isParticipant && !isOrganizer) {
        return ResponseHandler.failure(
          res,
          "You are not authorized to join this conference",
          403
        );
      }

      // Check if the meeting time is valid (within 15 minutes before start time)
      const now = new Date();
      const startDateTime = new Date(booking.startDate);
      const endDateTime = new Date(booking.endDate);

      // Allow joining 15 minutes before the scheduled time
      startDateTime.setMinutes(startDateTime.getMinutes() - 15);

      if (now < startDateTime) {
        return ResponseHandler.failure(
          res,
          `This conference is not yet available. It will start at ${booking.time} ${booking.startDate.toLocaleDateString()}`,
          400
        );
      }

      if (now > endDateTime) {
        // Update the status if the meeting is over
        if (booking.conferenceData) {
          if (booking.conferenceData.status !== "completed") {
            booking.conferenceData.status = "completed";
            await booking.save();
          }
        }

        return ResponseHandler.failure(res, "This conference has ended", 400);
      }

      // If conference is active, generate a token for the user
      if (
        booking.conferenceData &&
        booking.conferenceData.status === "scheduled"
      ) {
        booking.conferenceData.status = "active";
        await booking.save();
      }

      // Find user details for JWT
      let userName, userEmail, userAvatar;

      const user = await User.findById(userId);
      if (user) {
        userName = `${user.firstName} ${user.lastName}`;
        userEmail = user.email;
        userAvatar = "";
      } else {
        const admin = await SubAdmin.findById(userId);
        if (admin) {
          userName = `${admin.firstName} ${admin.lastName}`;
          userEmail = admin.email;
          userAvatar = "";
        } else {
          const orgAdmin = await Organization.findById(userId);
          if (orgAdmin) {
            userName = orgAdmin.name;
            userEmail = orgAdmin.email;
            userAvatar = "";
          }
        }
      }

      // Generate JWT token for Jitsi
      const privateKey = fs.readFileSync(
        path.join(__dirname, "jitsi-key.pk"),
        "utf8"
      );

      const isModerator = isOrganizer;

      const token = generate(privateKey, {
        id: userId.toString(),
        name: userName || "Anonymous",
        avatar: userAvatar || "",
        email: userEmail || "anonymous@example.com",
        appId:
          process.env.JITSI_APP_ID ||
          "vpaas-magic-cookie-e2c62d128f394864a5c13e8fc9f9bc0c",
        kid:
          process.env.JITSI_KID ||
          "vpaas-magic-cookie-e2c62d128f394864a5c13e8fc9f9bc0c/2bda53",
        moderator: isModerator,
        roomName: booking.conferenceData?.roomName || "",
        isRecorded: booking.conferenceData?.isRecorded || false,
      });

      return ResponseHandler.success(
        res,
        {
          token,
          conferenceData: booking.conferenceData,
          bookingDetails: {
            title: booking.title,
            description: booking.description,
            startTime: booking.time,
            endTime: booking.endTime,
            date: booking.startDate,
          },
        },
        "Conference joining token generated successfully"
      );
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        error.message || "An error occurred while joining the conference",
        error.status || 500
      );
    }
  }

  // Add method to handle conference recording
  async handleRecordingWebhook(req: Request, res: Response) {
    try {
      const { roomName, recordingUrl, status } = req.body;

      // Find the booking with this room name
      const booking = await Booking.findOne({
        "conferenceData.roomName": roomName,
      });

      if (!booking) {
        return ResponseHandler.failure(
          res,
          "Booking not found for this room",
          404
        );
      }

      // Update the recording URL
      if (booking.conferenceData) {
        booking.conferenceData.recordingUrl = recordingUrl;

        if (status === "completed") {
          booking.conferenceData.status = "completed";

          // Send notification to all participants that the recording is available
          const participants = booking.participants;
          const users = await User.find({ _id: { $in: participants } });
          const subAdmins = await SubAdmin.find({ _id: { $in: participants } });

          const allParticipants = [
            ...users.map((user) => ({
              email: user.email,
              firstName: user.firstName,
            })),
            ...subAdmins.map((subAdmin) => ({
              email: subAdmin.email,
              firstName: subAdmin.firstName,
            })),
          ];

          for (const participant of allParticipants) {
            const emailVariables = {
              email: participant.email,
              name: participant.firstName,
              bookingName: booking.title,
              subject: "Conference Recording Available",
              recordingUrl: recordingUrl,
              meetingDate: booking.startDate.toLocaleDateString(),
            };

            // await sendRecordingNotificatio(emailVariables);
          }
        }

        await booking.save();

        return ResponseHandler.success(
          res,
          booking,
          "Recording information updated successfully"
        );
      }
    } catch (error: any) {
      return ResponseHandler.failure(
        res,
        error.message ||
          "An error occurred while updating recording information",
        error.status || 500
      );
    }
  }
}

export default new BookingController();
