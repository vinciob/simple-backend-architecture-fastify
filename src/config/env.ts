import { Type, type Static } from "typebox";

/**
 * Environment schema for Fastify application
 * If any of the environment variables are missing or invalid, the application will fail to start.
 */
export const EnvSchema = Type.Object({
  NODE_ENV: Type.Union(
    [
      Type.Literal("development"),
      Type.Literal("test"),
      Type.Literal("production"),
    ],
    {
      default: "development",
    },
  ),

  PORT: Type.Integer({
    minimum: 1,
    maximum: 65535,
    default: 3000,
  }),

  HOST: Type.String({
    default: "0.0.0.0",
  }),
  CLIENT_ORIGIN: Type.String({
    pattern: "^https?://[^/]+$", // Must be a valid URL with http or https scheme and no trailing slash
  }),

  MONGODB_URI: Type.String({
    minLength: 1,
    pattern: "^mongodb(\\+srv)?://",
  }),

  MONGODB_DATABASE: Type.String({
    minLength: 1,
  }),

  MONGODB_POOL_SIZE: Type.Integer({
    minimum: 1,
    default: 10,
  }),

  JWT_SECRET: Type.String({ minLength: 32 }),
});

export type Env = Static<typeof EnvSchema>;
