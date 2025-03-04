// In a separate file, e.g., tokenDatabase.ts
import mongoose from "mongoose";

// Create a schema for storing tokens
const TokenSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  accessToken: { type: String, required: true },
  refreshToken: { type: String, required: true },
  expiryDate: { type: Date },
});

const TokenModel = mongoose.model("Token", TokenSchema);

export async function storeTokensInDatabase(userId: string, tokens: any) {
  try {
    await TokenModel.findOneAndUpdate(
      { userId },
      {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiryDate: tokens.expiry_date
          ? new Date(tokens.expiry_date)
          : undefined,
      },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error("Error storing tokens:", error);
  }
}

export async function retrieveTokensFromDatabase(userId: string) {
  try {
    const tokenDoc = await TokenModel.findOne({ userId });
    return tokenDoc
      ? {
          access_token: tokenDoc.accessToken,
          refresh_token: tokenDoc.refreshToken,
          expiry_date: tokenDoc.expiryDate,
        }
      : null;
  } catch (error) {
    console.error("Error retrieving tokens:", error);
    return null;
  }
}
