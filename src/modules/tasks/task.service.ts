import { ObjectId } from "mongodb";

import type { TaskDocument, TaskStatus } from "./task.model.ts";
import type { TaskRepository } from "./task.repository.ts";
import type {
  CreateTaskInput,
  UpdateTaskInput,
  TaskResponse,
  TaskListItem,
} from "./task.schema.ts";
import { errors } from "../../shared/errors/index.ts";

// Converts a TaskDocument to a TaskResponse object
function toTaskResponse(task: TaskDocument): TaskResponse {
  return {
    id: task._id.toHexString(),
    name: task.name,
    description: task.description,
    status: task.status,
    dueDate: task.dueDate?.toISOString() ?? null,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
    createdBy: task.createdBy.toHexString(),
  };
}

/**
 * Creates a task service for handling business logic related to tasks.
 * @param repository The task repository used for data access
 * @returns An object containing task-related service methods
 * @example
 * const taskService = createTaskService(taskRepository);
 * const task = await taskService.create({ name: "New Task" }, userId);
 */
export function createTaskService(repository: TaskRepository) {
  return {
    // Creates a new task with the given input and user ID
    async create(
      input: CreateTaskInput,
      userId: string,
    ): Promise<TaskResponse> {
      const now = new Date();

      const task = await repository.create({
        name: input.name.trim(),
        description: input.description ?? null,
        status: input.status ?? "created",
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        createdAt: now,
        updatedAt: now,
        createdBy: new ObjectId(userId),
      });

      return toTaskResponse(task);
    },

    // Finds a task by its ID and user ID
    async findById(id: string, userId: string): Promise<TaskResponse> {
      const task = await repository.findById(
        new ObjectId(id),
        new ObjectId(userId),
      );
      if (!task) throw errors.notFound("Task not found");
      return toTaskResponse(task);
    },

    // Finds all tasks for a given user ID
    async findAll(userId: string): Promise<TaskListItem[]> {
      const tasks = await repository.findAll(new ObjectId(userId));

      return tasks.map((task) => ({
        _id: task._id.toHexString(),
        name: task.name,
        dueDate: task.dueDate?.toISOString() ?? null,
        status: task.status,
      }));
    },

    // Updates a task by its ID and user ID with the given input
    async update(
      id: string,
      userId: string,
      input: UpdateTaskInput,
    ): Promise<TaskResponse> {
      const name = input.name?.trim();
      const description = input.description?.trim();
      const status = input.status?.trim() as TaskStatus | undefined;
      const dueDate = input.dueDate ? new Date(input.dueDate) : null;
      const task = await repository.update(
        new ObjectId(id),
        new ObjectId(userId),
        {
          ...(name !== undefined && { name: name }),
          ...(description !== undefined && { description: description }),
          ...(status !== undefined && { status: status }),
          ...(dueDate !== undefined && { dueDate: dueDate }),
        },
      );
      if (!task) throw errors.notFound("Task not found");
      return toTaskResponse(task);
    },

    // Deletes a task by its ID and user ID
    async delete(id: string, userId: string): Promise<void> {
      const deleted = await repository.delete(
        new ObjectId(id),
        new ObjectId(userId),
      );
      if (!deleted) throw errors.notFound("Task not found");
    },
  };
}

export type TaskService = ReturnType<typeof createTaskService>;
