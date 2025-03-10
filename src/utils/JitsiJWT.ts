const jwt = require("jsonwebtoken");
require("dotenv").config();

export const generateJitsiJWT = (user: {
  name: string;
  email: string;
  avatar: string;
}) => {
  const payload = {
    aud: "jitsi", // Audience
    iss: process.env.JITSI_APP_ID, // App ID from Jitsi
    sub: "8x8.vc", // Jitsi domain
    room: "*", // Can be a specific room or "*" for all rooms
    exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1-hour expiry
    context: {
      user: {
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    },
  };

  return jwt.sign(payload, process.env.JITSI_SECRET, { algorithm: "HS256" });
};
