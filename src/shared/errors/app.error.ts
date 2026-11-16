/**
 * Represents an application error with a message and an HTTP status code.
 */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 500,
  ) {
    super(message);
    this.name = "AppError";
  }
}
