import type { FastifyPluginAsync } from "fastify";
import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import type { TaskDocument } from "./task.model.ts";
import { createTaskRepository } from "./task.repository.ts";
import { createTaskService } from "./task.service.ts";

import {
  CreateTaskRouteSchema,
  GetTasksListRouteSchema,
  GetTaskRouteSchema,
  UpdateTaskRouteSchema,
  DeleteTaskRouteSchema,
} from "./task.schema.ts";

/**
 * Task routes for handling task-related HTTP requests
 */
export const taskRoutes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<TypeBoxTypeProvider>();
  const collection = app.mongo.db.collection<TaskDocument>("tasks");
  const repository = createTaskRepository(collection);
  const service = createTaskService(repository);

  // Protect every task route
  app.addHook("onRequest", app.authenticate);

  // POST /tasks
  app.post("/", { schema: CreateTaskRouteSchema }, async (request, reply) => {
    const task = await service.create(request.body, request.user.sub);
    return reply.code(201).send(task);
  });

  // GET /tasks
  app.get("/", { schema: GetTasksListRouteSchema }, async (request) => {
    return service.findAll(request.user.sub);
  });

  // GET /tasks/:id
  app.get("/:id", { schema: GetTaskRouteSchema }, async (request) => {
    return service.findById(request.params.id, request.user.sub);
  });

  // PATCH /tasks/:id
  app.patch("/:id", { schema: UpdateTaskRouteSchema }, async (request) => {
    return service.update(request.params.id, request.user.sub, request.body);
  });

  // DELETE /tasks/:id
  app.delete(
    "/:id",
    { schema: DeleteTaskRouteSchema },
    async (request, reply) => {
      await service.delete(request.params.id, request.user.sub);
      return reply.code(204).send();
    },
  );
};
