import { buildApp } from "./app.ts";

/**
 * Entry point for the server application.
 * Initializes and starts the server, and handles graceful shutdown.
 */
async function startServer() {
  let app: Awaited<ReturnType<typeof buildApp>> | undefined;

  try {
    app = await buildApp();
    const { PORT, HOST } = app.config;
    const server = app;

    // Graceful shutdown
    // This ensures that all ongoing requests are completed and resources are
    async function shutdown(signal: string) {
      server.log.info({ signal }, "Shutting down");
      try {
        await server.close();
        process.exitCode = 0;
      } catch (error) {
        server.log.error(error);
        process.exitCode = 1;
      }
    }
    process.once("SIGINT", () => {
      void shutdown("SIGINT");
    });

    process.once("SIGTERM", () => {
      void shutdown("SIGTERM");
    });

    await server.listen({ port: PORT, host: HOST });
  } catch (error) {
    if (app) {
      app.log.error(error);
      await app.close().catch(() => undefined);
    } else {
      console.error(error);
    }

    process.exitCode = 1;
  }
}

void startServer();
