import type { FastifyPluginAsync } from "fastify";

import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";

import type { UserDocument } from "./user.model.ts";

import { createUserRepository } from "./user.repository.ts";
import { createUserService } from "./user.service.ts";

import {
  registerRouteSchema,
  userInformationRouteSchema,
} from "./user.schema.ts";

export const userRoutes: FastifyPluginAsync = async (fastify) => {
  // Initialize Fastify app with TypeBox type provider
  const app = fastify.withTypeProvider<TypeBoxTypeProvider>();

  // Dependencies
  const collection = app.mongo.db.collection<UserDocument>("users");
  const repository = createUserRepository(collection);
  const service = createUserService(repository);

  // POST /users
  app.post("/", { schema: registerRouteSchema }, async (request, reply) => {
    const user = await service.register(request.body);
    const accessToken = app.jwt.sign({ sub: user.id });

    return reply.code(201).send({
      user,
      accessToken,
      tokenType: "Bearer",
    });
  });

  // GET /users/me
  app.get(
    "/me",
    {
      onRequest: [app.authenticate],
      schema: userInformationRouteSchema,
    },
    async (request) => {
      console.log(request.user);
      return service.getMe(request.user.sub);
    },
  );
};
