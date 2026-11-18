import type { ObjectId } from "mongodb";

/**
 * Represents a session document in the database.
 * refreshTokenHash stores the hash of the current refresh token.
 * usedTokenHashes stores the hashes of previously used refresh tokens to prevent reuse.
 */
export interface SessionDocument {
  _id: ObjectId;
  userId: ObjectId;

  refreshTokenHash: string;
  usedTokenHashes: string[];

  createdAt: Date;
  lastUsedAt: Date;
  expiresAt: Date;

  revokedAt: Date | null;
}
