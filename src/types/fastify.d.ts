import "fastify";

import type { MongoClient, Db } from "mongodb";
import type { Env } from "../config/env.ts";

/**
 * Extends FastifyInstance with configuration and MongoDB client
 * example usage:
 * - app.config.MONGODB_URI;
 * - app.config.PORT;
 * - app.mongo.db;
 */

declare module "fastify" {
  interface FastifyInstance {
    config: Env;
    mongo: {
      client: MongoClient;
      db: Db;
    };
    authenticate: (request: FastifyRequest) => Promise<void>;
  }
}

/**
 * Extends FastifyJWT with payload and user information
 */
declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: {
      sub: string;
      sid: string;
    };

    user: {
      sub: string;
      sid: string;
      iat?: number;
      exp?: number;
    };
  }
}
