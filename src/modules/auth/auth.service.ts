import * as argon2 from "argon2";
import type { UserRepository } from "../users/user.repository.ts";
import type { LoginInput } from "./auth.schema.ts";
import { errors } from "../../shared/errors/index.ts";

type AuthRepository = Pick<UserRepository, "findByEmail">;

export function createAuthService(repository: AuthRepository) {
  return {
    async login(input: LoginInput): Promise<string> {
      const email = input.email.trim().toLowerCase();
      const user = await repository.findByEmail(email);
      if (!user) throw errors.unauthorized();

      const isValid = await argon2.verify(user.passwordHash, input.password);
      if (!isValid) throw errors.unauthorized();

      return user._id.toHexString();
    },
  };
}
