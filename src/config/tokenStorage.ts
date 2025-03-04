// src/config/tokenStorage.ts

class TokenManager {
  private static instance: TokenManager;
  private tokens: { [key: string]: any } = {};

  private constructor() {}

  public static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  public setTokens(userId: string, tokens: any) {
    console.log(`Setting tokens for user: ${userId}`);
    console.log(
      `Tokens received: ${JSON.stringify({
        hasAccessToken: !!tokens.access_token,
        hasRefreshToken: !!tokens.refresh_token,
      })}`
    );

    if (!userId) {
      console.error("Attempted to store tokens with no user ID");
      throw new Error("Cannot store tokens without a user ID");
    }

    this.tokens[userId] = tokens;
  }

  public getTokens(userId: string) {
    console.log(`Retrieving tokens for user: ${userId}`);
    const tokens = this.tokens[userId];

    console.log(`Tokens found: ${!!tokens}`);
    if (!tokens) {
      console.error(`No tokens found for user: ${userId}`);
    }

    return tokens;
  }
}

export default TokenManager;
