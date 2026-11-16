import type { FastifyPluginAsync } from "fastify";
import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import type { UserDocument } from "../users/user.model.ts";
import { createUserRepository } from "../users/user.repository.ts";
import { createAuthService } from "./auth.service.ts";
import { LoginRouteSchema } from "./auth.schema.ts";

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<TypeBoxTypeProvider>();

  const collection = app.mongo.db.collection<UserDocument>("users");

  const repository = createUserRepository(collection);
  const service = createAuthService(repository);

  // POST /auth/login
  app.post("/login", { schema: LoginRouteSchema }, async (request) => {
    const userId = await service.login(request.body);
    const accessToken = app.jwt.sign({
      sub: userId,
    });

    return {
      accessToken,
      tokenType: "Bearer" as const,
    };
  });
};
