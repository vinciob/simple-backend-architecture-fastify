import { AppError } from "./app.error.ts";

/**
 * A collection of common application errors.
 */
export const errors = {
  badRequest: (message = "Bad Request") => new AppError(message, 400),
  unauthorized: (message = "Unauthorized") => new AppError(message, 401),
  forbidden: (message = "Forbidden") => new AppError(message, 403),
  notFound: (message = "Not Found") => new AppError(message, 404),
  conflict: (message = "Conflict") => new AppError(message, 409),
  internal: (message = "Internal Server Error") => new AppError(message, 500),
};
