export enum ErrorType {
  BAD_REQUEST = "BAD_REQUEST",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  NOT_FOUND = "NOT_FOUND",
  INTERNAL_SERVER = "INTERNAL_SERVER",
}

export class CustomError extends Error {
  public type: ErrorType;
  public statusCode: number;
  public details?: any;

  constructor(
    type: ErrorType,
    message: string,
    statusCode: number,
    details?: any
  ) {
    super(message);
    this.type = type;
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}
