import Fastify, {
  type FastifyError,
  type FastifyReply,
  type FastifyRequest,
  type FastifyServerOptions,
} from "fastify";
import { databasePlugin } from "./plugins/database.ts";
import fastifyEnv from "@fastify/env";
import { EnvSchema } from "./config/env.ts";
import { userRoutes } from "./modules/users/users.routes.ts";
import fastifyCookie from "@fastify/cookie";
import { AppError } from "./shared/errors/app.error.ts";

export async function buildApp(options: FastifyServerOptions = {}) {
  const app = Fastify({
    logger: true,
    ...options,
  });

  // Environment configuration using fastify-env plugin
  await app.register(fastifyEnv, {
    schema: EnvSchema,
    dotenv: true,
    confKey: "config",
  });

  // Register cookie plugin for handling cookies
  await app.register(fastifyCookie);

  // Register Database plugin
  app.register(databasePlugin);

  // Register feature modules
  await app.register(userRoutes, { prefix: "/users" });

  // Global error handler
  app.setErrorHandler(
    (error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
      request.log.error(error);

      const statusCode =
        error instanceof AppError
          ? error.statusCode
          : (error.statusCode ?? 500);

      return reply.code(statusCode).send({
        statusCode,
        error: statusCode >= 500 ? "Internal Server Error" : error.name,
        message:
          statusCode >= 500 ? "An unexpected error occurred" : error.message,
      });
    },
  );

  // Health check
  app.get("/health", async () => {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
    };
  });

  // Database readiness check
  app.get("/health/db", async () => {
    await app.mongo.db.command({ ping: 1 });

    return {
      status: "ok",
      database: "mongodb",
    };
  });

  return app;
}
