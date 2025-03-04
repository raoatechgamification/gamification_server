import { calendar_v3, google } from "googleapis";
import { v4 as uuidv4 } from "uuid";
import { getOAuthClient } from "../config/googleAuth.config";
import TokenManager from "../config/tokenStorage";

export const scheduleMeeting = async (
  eventDetails: {
    summary: string;
    description: string;
    startTime: string;
    endTime: string;
    attendees: { email: string }[];
    timeZone: string;
  },
  userId?: string
) => {
  try {
    // Always pass the userId
    const oauth2Client = getOAuthClient(userId || "default");

    // Log tokens to debug
    const tokenManager = TokenManager.getInstance();
    const tokens = tokenManager.getTokens(userId || "default");

    console.log("Tokens for user:", userId);
    console.log("Actual tokens:", tokens);

    // If no tokens found, throw a meaningful error
    if (!tokens) {
      throw new Error(
        "No authentication tokens found. Please complete Google OAuth flow."
      );
    }

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    const requestId = uuidv4();

    const event: calendar_v3.Schema$Event = {
      summary: eventDetails.summary,
      description: eventDetails.description,
      start: {
        dateTime: eventDetails.startTime,
        timeZone: eventDetails.timeZone,
      },
      end: {
        dateTime: eventDetails.endTime,
        timeZone: eventDetails.timeZone,
      },
      attendees: eventDetails.attendees,
      conferenceData: {
        createRequest: { requestId },
      },
    };

    const response = await calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
      conferenceDataVersion: 1,
    });

    return response.data;
  } catch (error: any) {
    console.error("Detailed Error scheduling meeting:", error);
    throw new Error(error.message || "Failed to schedule meeting");
  }
};
