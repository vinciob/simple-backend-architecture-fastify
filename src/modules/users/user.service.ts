import * as argon2 from "argon2";
import { MongoServerError } from "mongodb";

import type { UserRepository } from "./user.repository.ts";
import type { UserDocument } from "./user.model.ts";

import type { RegisterUserInput, UserInfoResponse } from "./user.schema.ts";
import { errors } from "../../shared/errors/index.ts";

/**
 * Creates a user service for handling user-related operations.
 * @param userRepository The user repository for database interactions.
 * @returns An object with methods for registering users and retrieving user info.
 * @example
 * const userService = createUserService(userRepository);
 * const newUser = await userService.register({ name: "John Doe", email: "john@example.com", password: "password123" });
 * const me = await userService.getMe(newUser.id);
 */
export function createUserService(userRepository: UserRepository) {
  return {
    /**
     * Registers a new user with the provided input data.
     */
    async register(input: RegisterUserInput): Promise<UserInfoResponse> {
      const email = input.email.trim().toLowerCase();
      const existingUser = await userRepository.findByEmail(email);
      if (existingUser) throw errors.conflict("Email already registered");

      const passwordHash = await argon2.hash(input.password, {
        type: argon2.argon2id,
      });

      const now = new Date();

      try {
        const user = await userRepository.create({
          name: input.name.trim(),
          email,
          passwordHash,
          createdAt: now,
          updatedAt: now,
        });

        return toUserResponse(user);
      } catch (error) {
        if (error instanceof MongoServerError && error.code === 11000) {
          throw errors.conflict("Email already registered");
        }

        throw error;
      }
    },

    /**
     * Retrieves the information of the currently authenticated user.
     */
    async getMe(userId: string): Promise<UserInfoResponse> {
      const user = await userRepository.findById(userId);

      if (!user) {
        throw errors.notFound("User not found");
      }

      return toUserResponse(user);
    },
  };
}

export type UserService = ReturnType<typeof createUserService>;

/**
 * Parses a user document to a user info response.
 */
function toUserResponse(user: UserDocument): UserInfoResponse {
  return {
    id: user._id.toHexString(),
    name: user.name,
    email: user.email,
    createdAt: user.createdAt.toISOString(),
  };
}
