import { Type, type Static } from "typebox";

/**
 * Schema for login request and response
 */
export const LoginSchema = Type.Object(
  {
    email: Type.String({ format: "email", maxLength: 254 }),
    password: Type.String({ minLength: 1 }),
  },
  {
    additionalProperties: false,
  },
);

export const LoginResponseSchema = Type.Object({
  accessToken: Type.String(),
  tokenType: Type.Literal("Bearer"),
});

export type LoginInput = Static<typeof LoginSchema>;

/**
 * Type for login request input
 */

const schemaAuthTag = "Auth";

export const LoginRouteSchema = {
  tags: [schemaAuthTag],
  body: LoginSchema,
  response: {
    200: LoginResponseSchema,
  },
};

export const RefreshTokenRouteSchema = {
  tags: [schemaAuthTag],
  response: {
    200: LoginResponseSchema,
  },
};

export const LogoutRouteSchema = {
  tags: [schemaAuthTag],
  response: {
    204: { type: "null" },
  },
};
