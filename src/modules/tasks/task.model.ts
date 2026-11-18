import type { ObjectId } from "mongodb";
export type TaskStatus = "created" | "in_progress" | "completed";

/**
 * Task document interface representing a task in the database
 */
export interface TaskDocument {
  _id: ObjectId;
  name: string;
  description: string | null;
  status: TaskStatus;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: ObjectId;
}

export type NewTaskDocument = Omit<TaskDocument, "_id">;
