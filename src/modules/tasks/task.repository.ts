import { ObjectId, type Collection } from "mongodb";
import type {
  TaskDocument,
  NewTaskDocument,
  TaskStatus,
} from "./task.model.ts";

interface TaskListDocument {
  _id: ObjectId;
  name: string;
  dueDate: Date | null;
  status: TaskStatus;
}

/**
 * Creates a task repository for performing CRUD operations on tasks.
 */
export function createTaskRepository(collection: Collection<TaskDocument>) {
  return {
    // Create a new task in the collection
    async create(data: NewTaskDocument): Promise<TaskDocument> {
      const task: TaskDocument = { ...data, _id: new ObjectId() };
      await collection.insertOne(task);
      return task;
    },

    // Find a task by its ID and the user who created it
    async findById(id: ObjectId, userId: ObjectId) {
      return collection.findOne({ _id: id, createdBy: userId });
    },

    // Find all tasks created by a specific user
    async findAll(userId: ObjectId): Promise<TaskListDocument[]> {
      return collection
        .find({ createdBy: userId })
        .project<TaskListDocument>({
          _id: 1,
          name: 1,
          dueDate: 1,
          status: 1,
        })
        .sort({ createdAt: -1 })
        .toArray();
    },

    // Update a task by its ID and the user who created it
    async update(
      id: ObjectId,
      userId: ObjectId,
      data: Partial<
        Pick<TaskDocument, "name" | "description" | "dueDate" | "status">
      >,
    ) {
      return collection.findOneAndUpdate(
        { _id: id, createdBy: userId },
        { $set: { ...data, updatedAt: new Date() } },
        { returnDocument: "after" },
      );
    },

    // Delete a task by its ID and the user who created it
    async delete(id: ObjectId, userId: ObjectId): Promise<boolean> {
      const result = await collection.deleteOne({
        _id: id,
        createdBy: userId,
      });
      return result.deletedCount === 1;
    },

    // Ensure necessary indexes exist for the collection
    async ensureIndexes() {
      await collection.createIndex({ createdBy: 1, createdAt: -1 });
    },
  };
}

export type TaskRepository = ReturnType<typeof createTaskRepository>;
