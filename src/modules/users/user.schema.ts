import { Type, type Static } from "typebox";

/**
 * User information schema
 */
export const UserResponseSchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
  email: Type.String(),
  createdAt: Type.String({ format: "date-time" }),
});
export type UserInfoResponse = Static<typeof UserResponseSchema>;

/**
 * Register user schema
 */
export const RegisterUserSchema = Type.Object(
  {
    name: Type.String({
      minLength: 2,
      maxLength: 100,
    }),

    email: Type.String({
      format: "email",
      maxLength: 254,
    }),

    password: Type.String({
      minLength: 12,
      maxLength: 128,
    }),
  },
  {
    additionalProperties: false,
  },
);
export type RegisterUserInput = Static<typeof RegisterUserSchema>;

/**
 * Register user response schema
 */
export const RegisterResponseSchema = Type.Object({
  user: UserResponseSchema,
  accessToken: Type.String(),
  tokenType: Type.Literal("Bearer"),
});
export type RegisterUserResponse = Static<typeof RegisterResponseSchema>;

/**
 * Route tags for user-related endpoints
 */

const schemaUserTag = "Users";

export const registerRouteSchema = {
  tags: [schemaUserTag],
  body: RegisterUserSchema,
  response: {
    201: RegisterResponseSchema,
  },
};

export const userInformationRouteSchema = {
  tags: [schemaUserTag],
  security: [{ bearerAuth: [] }],
  response: {
    200: UserResponseSchema,
  },
};
