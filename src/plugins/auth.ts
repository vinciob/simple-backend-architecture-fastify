import fp from "fastify-plugin";
import jwt from "@fastify/jwt";

import type { FastifyRequest } from "fastify";
import { ACCESS_TOKEN_TTL } from "../modules/auth/auth.utils.ts";
import { errors } from "../shared/errors/index.ts";

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
        expiresIn: ACCESS_TOKEN_TTL,
      },
      verify: {
        algorithms: ["HS256"],
      },
    });

    // Add "authenticate" method to the Fastify instance
    app.decorate("authenticate", async (request: FastifyRequest) => {
      await request.jwtVerify();

      const { sub, sid } = request.user;

      // Validate that the "sub" and "sid" claims are valid MongoDB ObjectId strings
      const objectIdPattern = /^[a-f0-9]{24}$/i;
      if (
        !objectIdPattern.test(sub ?? "") ||
        !objectIdPattern.test(sid ?? "")
      ) {
        throw errors.unauthorized("Invalid access token");
      }
    });
  },
  { name: "auth" },
);
