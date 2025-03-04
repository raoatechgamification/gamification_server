import { google } from "googleapis";
import TokenManager from "./tokenStorage";

const SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/calendar.events",
];

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export const getAuthUrl = (): string =>
  oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });

export const getTokens = async (code: string) => {
  try {
    console.log("Getting tokens with code:", code);

    const { tokens } = await oauth2Client.getToken(code);

    console.log("Tokens received:", {
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token,
    });

    oauth2Client.setCredentials(tokens);
    return tokens;
  } catch (error) {
    console.error("Error in getTokens:", error);
    throw error;
  }
};

// In googleAuth.config.ts
export const getOAuthClient = (userId?: string) => {
  console.log(`Getting OAuth client for user: ${userId}`);

  const tokenManager = TokenManager.getInstance();

  // If no userId provided, try to use a default
  const tokens = userId
    ? tokenManager.getTokens(userId)
    : tokenManager.getTokens("default");

  console.log(`Tokens retrieved: ${!!tokens}`);

  if (!tokens) {
    console.error("No tokens found for user:", userId);
    throw new Error(
      "No authentication tokens available. Please complete Google OAuth flow."
    );
  }

  // Create a new client to avoid modifying the existing one
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  // Set credentials on the new client
  client.setCredentials(tokens);

  return client;
};
