import fp from "fastify-plugin";
import jwt from "@fastify/jwt";

export const authPlugin = fp(
  async (app) => {
    await app.register(jwt, {
      secret: app.config.JWT_SECRET,
      sign: {
        expiresIn: "1h",
      },
    });
  },
  {
    name: "auth",
  },
);
