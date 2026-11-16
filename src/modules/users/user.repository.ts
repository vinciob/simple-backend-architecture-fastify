import { ObjectId, type Collection } from "mongodb";

import type { UserDocument, NewUserDocument } from "./user.model.ts";

/**
 * Creates a user repository for performing CRUD operations on the users collection.
 * @param collection The MongoDB collection for users.
 * @returns An object with methods for creating, finding, and indexing users.
 */
export function createUserRepository(collection: Collection<UserDocument>) {
  return {
    async create(data: NewUserDocument): Promise<UserDocument> {
      const document: UserDocument = {
        ...data,
        _id: new ObjectId(),
      };

      await collection.insertOne(document);

      return document;
    },

    async findById(id: string): Promise<UserDocument | null> {
      if (!ObjectId.isValid(id)) {
        return null;
      }

      return collection.findOne({
        _id: new ObjectId(id),
      });
    },

    async findByEmail(email: string): Promise<UserDocument | null> {
      return collection.findOne({ email });
    },
  };
}

export type UserRepository = ReturnType<typeof createUserRepository>;
