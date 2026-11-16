// Plugins
import fastifyCookie from "@fastify/cookie";
import fastifyEnv from "@fastify/env";
import { authPlugin } from "./plugins/auth.ts";
import { databasePlugin } from "./plugins/database.ts";
// Routes
import { userRoutes } from "./modules/users/users.routes.ts";
// Environment configuration
import { EnvSchema } from "./config/env.ts";
// Errors
import { AppError } from "./shared/errors/app.error.ts";
// Types
import Fastify, {
  type FastifyError,
  type FastifyReply,
  type FastifyRequest,
  type FastifyServerOptions,
} from "fastify";
import { authRoutes } from "./modules/auth/auth.routes.ts";

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

  // JWT + middleware
  await app.register(authPlugin);

  // Register Database plugin
  app.register(databasePlugin);

  // Register feature modules
  await app.register(userRoutes, { prefix: "/users" });
  await app.register(authRoutes, { prefix: "/auth" });

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
