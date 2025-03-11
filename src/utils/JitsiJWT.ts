// const jwt = require("jsonwebtoken");
// require("dotenv").config();

// export const generateJitsiJWT = (user: {
//   name: string;
//   email: string;
//   avatar: string;
// }) => {
//   const payload = {
//     aud: "jitsi",
//     iss: "chat",
//     iat: 1741691828,
//     exp: 1741699028,
//     nbf: 1741691823,
//     sub: "vpaas-magic-cookie-e2c62d128f394864a5c13e8fc9f9bc0c",
//     context: {
//       features: {
//         livestreaming: true,
//         "outbound-call": true,
//         "sip-outbound-call": false,
//         transcription: true,
//         recording: true,
//       },
//       user: {
//         "hidden-from-recorder": false,
//         moderator: true,
//         name: "ajibadeemmanuel58",
//         id: "google-oauth2|101804133815417547050",
//         avatar: "",
//         email: "ajibadeemmanuel58@gmail.com",
//       },
//     },
//     room: "*",
//   };
//   // {
//   //   aud: "jitsi", // Audience
//   //   iss: process.env.JITSI_APP_ID, // App ID from Jitsi
//   //   sub: "8x8.vc", // Jitsi domain
//   //   room: "*", // Can be a specific room or "*" for all rooms
//   //   exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1-hour expiry
//   //   context: {
//   //     user: {
//   //       name: user.name,
//   //       email: user.email,
//   //       avatar: user.avatar,
//   //     },
//   //   },
//   // };

//   return jwt.sign(payload, process.env.JITSI_SECRET, { algorithm: "HS256" });
// };

// jitsiTokenController.js
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

/**
 * Generate a Jitsi JWT token for authentication
 */
export const generateJitsiToken = async (req: any, res: any) => {
  try {
    const { name, email, room = "room" } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required",
      });
    }

    // Your Jitsi app information
    const JITSI_APP_ID = "vpaas-magic-cookie-e2c62d128f394864a5c13e8fc9f9bc0c";
    const JITSI_APP_SECRET = process.env.JITSI_APP_SECRET;

    if (!JITSI_APP_SECRET) {
      console.error("JITSI_APP_SECRET not found in environment variables");
      return res.status(500).json({
        success: false,
        message: "Server configuration error",
      });
    }

    // Create payload for JWT
    const payload = {
      aud: "jitsi",
      iss: "chat",
      sub: JITSI_APP_ID,
      exp: Math.floor(Date.now() / 1000) + 3600, // Token expires in 1 hour
      nbf: Math.floor(Date.now() / 1000) - 10, // Not before 10 seconds ago
      room: room, // Specific room name
      context: {
        user: {
          name: name,
          email: email,
          id: email, // You might want to use a proper user ID here
          moderator: true,
          "hidden-from-recorder": false,
          avatar: "",
        },
        features: {
          livestreaming: true,
          recording: true,
          transcription: true,
          "outbound-call": true,
          "sip-outbound-call": false,
        },
      },
    };

    // Header for the JWT
    const header = {
      kid: `${JITSI_APP_ID}/e31361-SAMPLE_APP`, // Replace SAMPLE_APP with your app name
      alg: "HS256",
      typ: "JWT",
    };

    // Sign the JWT
    const token = jwt.sign(payload, JITSI_APP_SECRET, { header });

    // Return the generated token
    return res.status(200).json({
      success: true,
      token,
    });
  } catch (error: any) {
    console.error("Error generating Jitsi token:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate token",
      error: error.message,
    });
  }
};
