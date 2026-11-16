import type { ObjectId } from "mongodb";

export interface UserDocument {
  _id: ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export type NewUserDocument = Omit<UserDocument, "_id">;
