import { calendar_v3, google } from "googleapis";
import { v4 as uuidv4 } from "uuid";
import { getOAuthClient } from "../config/googleAuth.config";

export const scheduleMeeting = async (eventDetails: {
  summary: string;
  description: string;
  startTime: string;
  endTime: string;
  attendees: { email: string }[];
  timeZone: string;
}) => {
  try {
    const calendar = google.calendar({ version: "v3", auth: getOAuthClient() });

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

    console.log(response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error scheduling meeting:", error);
    throw new Error(error.message || "Failed to schedule meeting");
  }
};
