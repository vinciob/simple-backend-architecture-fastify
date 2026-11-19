import type { ObjectId } from "mongodb";

/**
 * User document interface representing a user in the database.
 */
export interface UserDocument {
  _id: ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export type NewUserDocument = Omit<UserDocument, "_id">;
