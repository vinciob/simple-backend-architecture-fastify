import { randomBytes, createHash } from "node:crypto";
import { ObjectId } from "mongodb";

export const ACCESS_TOKEN_TTL = 10 * 60; // 10 minutes in seconds
export const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60; // 7 days in seconds

/**
 * Generates a new refresh token for the given session ID.
 * @param sessionId The ID of the session.
 * @returns The generated refresh token.
 */
export function generateRefreshToken(sessionId: ObjectId): string {
  const secret = randomBytes(32).toString("hex");
  return `${sessionId.toHexString()}.${secret}`;
}

/**
 * Hashes the given refresh token using SHA-256.
 * @param token The refresh token to hash.
 * @returns The SHA-256 hash of the token.
 */
export function hashRefreshToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Parses a refresh token and extracts the session ID and token hash.
 * @param token The refresh token to parse.
 * @returns An object containing the session ID and token hash, or null if the token is invalid.
 */
export function parseRefreshToken(token: string) {
  const match = /^([a-f0-9]{24})\.([a-f0-9]{64})$/.exec(token);
  if (!match) return null;

  return {
    sessionId: new ObjectId(match[1]!),
    tokenHash: hashRefreshToken(token),
  };
}
