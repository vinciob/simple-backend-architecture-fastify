import * as argon2 from "argon2";
import { ObjectId } from "mongodb";
import type { UserRepository } from "../users/user.repository.ts";
import type { LoginInput } from "./auth.schema.ts";
import {
  generateRefreshToken,
  hashRefreshToken,
  parseRefreshToken,
  REFRESH_TOKEN_TTL,
} from "./auth.utils.ts";
import type { AuthRepository } from "./auth.repository.ts";
import { errors } from "../../shared/errors/index.ts";
import type { SessionDocument } from "./auth.model.ts";

/**
 * Creates an authentication service with login, refresh, and logout capabilities.
 * @param userRepository - Repository for user data.
 * @param authRepository - Repository for authentication sessions.
 * @returns An object containing login, refresh, and logout methods.
 * @example
 * const authService = createAuthService(userRepository, authRepository);
 * const loginResult = await authService.login({ email: "user@example.com", password: "password" });
 * const refreshResult = await authService.refresh(loginResult.refreshToken);
 * await authService.logout(loginResult.refreshToken);
 */
export function createAuthService(
  userRepository: UserRepository,
  authRepository: AuthRepository,
) {
  return {
    // Logs in a user and creates a new session with a refresh token.
    async login(input: LoginInput) {
      const email = input.email.trim().toLowerCase();
      const user = await userRepository.findByEmail(email);
      if (!user) throw errors.unauthorized("Invalid credentials");

      const validPassword = await argon2.verify(
        user.passwordHash,
        input.password,
      );

      if (!validPassword) throw errors.unauthorized("Invalid credentials");

      const now = new Date();
      const sessionId = new ObjectId();
      const refreshToken = generateRefreshToken(sessionId);

      const session: SessionDocument = {
        _id: sessionId,
        userId: user._id,
        refreshTokenHash: hashRefreshToken(refreshToken),
        usedTokenHashes: [],
        createdAt: now,
        lastUsedAt: now,
        expiresAt: new Date(now.getTime() + REFRESH_TOKEN_TTL * 1000),
        revokedAt: null,
      };

      await authRepository.create(session);

      return {
        userId: user._id.toHexString(),
        sessionId: sessionId.toHexString(),
        refreshToken,
        expiresAt: session.expiresAt,
      };
    },

    // Refreshes a user's session using a valid refresh token.
    async refresh(token: string) {
      const parsed = parseRefreshToken(token);
      if (!parsed) throw errors.unauthorized("Invalid refresh token");

      const { sessionId, tokenHash } = parsed;
      const nextToken = generateRefreshToken(sessionId);

      // Atomic compare-and-swap
      const updated = await authRepository.rotate(
        sessionId,
        tokenHash,
        hashRefreshToken(nextToken),
      );

      if (!updated) {
        // A reused token invalidates its session.
        await authRepository.revokeIfReused(sessionId, tokenHash);
        throw errors.unauthorized("Invalid refresh token");
      }

      // Check that the account still exists.
      const user = await userRepository.findById(updated.userId.toHexString());

      if (!user) {
        await authRepository.revokeByToken(
          sessionId,
          hashRefreshToken(nextToken),
        );
        throw errors.unauthorized("Invalid refresh token");
      }

      return {
        userId: user._id.toHexString(),
        sessionId: sessionId.toHexString(),
        refreshToken: nextToken,
        expiresAt: updated.expiresAt,
      };
    },

    async logout(token: string) {
      const parsed = parseRefreshToken(token);
      if (!parsed) return;
      await authRepository.revokeByToken(parsed.sessionId, parsed.tokenHash);
    },
  };
}

export type AuthService = ReturnType<typeof createAuthService>;
