import fp from "fastify-plugin";
import { MongoClient } from "mongodb";

/**
 * Fastify plugin for MongoDB database connection.
 */
export const databasePlugin = fp(
  async (app) => {
    const client = new MongoClient(app.config.MONGODB_URI, {
      maxPoolSize: app.config.MONGODB_POOL_SIZE,
      serverSelectionTimeoutMS: 5000,
    });

    try {
      await client.connect();
      const db = client.db(app.config.MONGODB_DATABASE);
      await db.command({ ping: 1 });

      // Decorate the Fastify instance with the MongoDB client and database instance
      app.decorate("mongo", { client, db });

      // Add a hook to close the MongoDB client for graceful shutdown
      app.addHook("onClose", async () => {
        await client.close();
      });

      app.log.info("MongoDB connected");
    } catch (error) {
      await client.close();
      throw error;
    }
  },
  { name: "database" },
);
