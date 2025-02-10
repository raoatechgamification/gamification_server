import { google } from 'googleapis';
import { getOAuthClient } from '../config/googleAuth.config';

export const scheduleMeeting = async (eventDetails: {
  summary: string;
  description: string;
  startTime: string;
  endTime: string;
  attendees: { email: string }[];
}) => {
  const calendar = google.calendar({ version: 'v3', auth: getOAuthClient() });

  const event = {
    summary: eventDetails.summary,
    description: eventDetails.description,
    start: {
      dateTime: eventDetails.startTime,
      timeZone: 'UTC',
    },
    end: {
      dateTime: eventDetails.endTime,
      timeZone: 'UTC',
    },
    attendees: eventDetails.attendees,
    conferenceData: {
      createRequest: { requestId: 'sample123' },
    },
  };

  const response = await calendar.events.insert({
    calendarId: 'primary',
    resource: event,
    conferenceDataVersion: 1,
  });

  return response.data;
};
