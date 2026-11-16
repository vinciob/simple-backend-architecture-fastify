import fp from "fastify-plugin";
import jwt from "@fastify/jwt";

import type { FastifyRequest } from "fastify";

/**
 * Auth plugin for Fastify
 * Registers JWT authentication and adds an "authenticate" method to the Fastify instance
 */
export const authPlugin = fp(
  async (app) => {
    await app.register(jwt, {
      secret: app.config.JWT_SECRET,
      sign: {
        algorithm: "HS256",
        expiresIn: "1h",
      },
      verify: {
        algorithms: ["HS256"],
      },
    });

    // Add "authenticate" method to the Fastify instance
    app.decorate("authenticate", async (request: FastifyRequest) => {
      await request.jwtVerify();
    });
  },
  {
    name: "auth",
  },
);
