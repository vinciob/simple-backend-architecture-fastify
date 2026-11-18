import type { FastifyPluginAsync, FastifyReply } from "fastify";
import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import type { UserDocument } from "../users/user.model.ts";
import { createUserRepository } from "../users/user.repository.ts";
import { createAuthService } from "./auth.service.ts";
import {
  LoginRouteSchema,
  LogoutRouteSchema,
  RefreshTokenRouteSchema,
} from "./auth.schema.ts";
import { createAuthRepository } from "./auth.repository.ts";
import type { SessionDocument } from "./auth.model.ts";
import { errors } from "../../shared/errors/index.ts";
import { ACCESS_TOKEN_TTL } from "./auth.utils.ts";

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<TypeBoxTypeProvider>();

  const collUsers = app.mongo.db.collection<UserDocument>("users");
  const colSessions = app.mongo.db.collection<SessionDocument>("sessions");

  const userRepository = createUserRepository(collUsers);
  const authRepository = createAuthRepository(colSessions);
  const service = createAuthService(userRepository, authRepository);

  const COOKIE_NAME = "refreshToken";

  const cookieOptions = {
    httpOnly: true,
    secure: app.config.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/auth",
  };

  function signAccessToken(userId: string, sessionId: string) {
    return app.jwt.sign({
      sub: userId,
      sid: sessionId,
    });
  }

  // Sets the refresh token cookie with the appropriate options and expiration time
  function setRefreshCookie(
    reply: FastifyReply,
    token: string,
    expiresAt: Date,
  ) {
    const maxAge = Math.max(
      0,
      Math.floor((expiresAt.getTime() - Date.now()) / 1000),
    );

    reply.setCookie(COOKIE_NAME, token, {
      ...cookieOptions,
      maxAge,
    });
  }

  // POST /auth/login
  app.post("/login", { schema: LoginRouteSchema }, async (request, reply) => {
    const result = await service.login(request.body);
    setRefreshCookie(reply, result.refreshToken, result.expiresAt);

    return {
      accessToken: signAccessToken(result.userId, result.sessionId),
      tokenType: "Bearer" as const,
      expiresIn: ACCESS_TOKEN_TTL,
    };
  });

  // POST /auth/refresh
  app.post(
    "/refresh",
    { schema: RefreshTokenRouteSchema },
    async (request, reply) => {
      const token = request.cookies[COOKIE_NAME];
      if (!token) throw errors.unauthorized("Refresh token missing");

      const result = await service.refresh(token);
      setRefreshCookie(reply, result.refreshToken, result.expiresAt);

      return {
        accessToken: signAccessToken(result.userId, result.sessionId),
        tokenType: "Bearer" as const,
      };
    },
  );

  // POST /auth/logout
  app.post("/logout", { schema: LogoutRouteSchema }, async (request, reply) => {
    const token = request.cookies[COOKIE_NAME];
    if (token) await service.logout(token);

    reply.clearCookie(COOKIE_NAME, cookieOptions);
    return reply.code(204).send();
  });
};
