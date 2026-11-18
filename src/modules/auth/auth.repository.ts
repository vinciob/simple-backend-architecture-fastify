import { ObjectId, type Collection } from "mongodb";
import type { SessionDocument } from "./auth.model.ts";

/**
 * Auth repository for managing sessions and refresh tokens in MongoDB
 */
export function createAuthRepository(collection: Collection<SessionDocument>) {
  return {
    // Create a new session document in the collection
    async create(data: SessionDocument) {
      await collection.insertOne(data);
      return data;
    },

    // Rotate the refresh token for a session
    async rotate(sessionId: ObjectId, oldHash: string, newHash: string) {
      const now = new Date();

      // Use findOneAndUpdate to avoid concurrent modifications and ensure atomicity
      return collection.findOneAndUpdate(
        {
          _id: sessionId,
          refreshTokenHash: oldHash,
          revokedAt: null,
          expiresAt: { $gt: now },
        },
        {
          $set: {
            refreshTokenHash: newHash,
            lastUsedAt: now,
          },
          $push: {
            usedTokenHashes: oldHash,
          },
        },
        {
          returnDocument: "after",
        },
      );
    },

    // Revoke a session if the refresh token has been reused
    async revokeIfReused(sessionId: ObjectId, tokenHash: string) {
      return collection.updateOne(
        {
          _id: sessionId,
          usedTokenHashes: tokenHash,
          revokedAt: null,
        },
        {
          $set: {
            revokedAt: new Date(),
          },
        },
      );
    },

    // Revoke a session by its token hash
    async revokeByToken(sessionId: ObjectId, tokenHash: string) {
      return collection.updateOne(
        {
          _id: sessionId,
          revokedAt: null,
          $or: [
            { refreshTokenHash: tokenHash },
            { usedTokenHashes: tokenHash },
          ],
        },
        {
          $set: { revokedAt: new Date() },
        },
      );
    },

    // Ensure the necessary indexes exist on the collection
    async ensureIndexes() {
      await collection.createIndex({ userId: 1, revokedAt: 1 });
      await collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    },
  };
}

// Type for the auth repository
export type AuthRepository = ReturnType<typeof createAuthRepository>;
