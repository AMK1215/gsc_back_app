// message , status code, data, error code

export enum ErrorCode {
    USER_NOT_FOUND = 404,
    USER_ALREADY_EXISTS = 409,
    INCORRECT_PASSWORD = 401,
    UNPROCESSABLE_ENTITY = 422,
    INTERNAL_EXCEPTION = 500,
    UNAUTHORIZED = 401,
    Email_ALREADY_EXISTS = 409,
    INVALID_CREDENTIALS = 401,
    INVALID_INPUT = 400,
    INVALID_TOKEN = 401,
    TOKEN_EXPIRED = 401,
    INVALID_PASSWORD = 400,
    INVALID_EMAIL = 400,
    INVALID_PHONE = 400,
    INVALID_NAME = 400,
    INVALID_ADDRESS = 400,
    INVALID_DATE = 400,
    INVALID_TIME = 400,
    INVALID_DATE_TIME = 400,
    INVALID_URL = 400,
    INVALID_FILE = 400,
    INVALID_IMAGE = 400,
    INVALID_VIDEO = 400,
    INVALID_AUDIO = 400,
    INVALID_DOCUMENT = 400,
    TOKEN_NOT_FOUND = 404,
    PRODUCT_NOT_FOUND = 404,
    ADDRESS_ALREADY_EXISTS = 409,
    ADDRESS_NOT_FOUND = 404,
    FORBIDDEN = 403,
  }
  
  export class HttpException extends Error {
    public readonly message: string;
    public readonly errorCode: ErrorCode;
    public readonly statusCode: number;
    public readonly errors: any;
  
    constructor(
      message: string,
      errorCode: ErrorCode,
      statusCode: number,
      errors?: any
    ) {
      super(message);
      this.message = message;
      this.errorCode = errorCode;
      this.statusCode = statusCode;
      this.errors = errors;
    }
  }
  
  export class BadRequestsException extends HttpException {
    constructor(message: string, errorCode: ErrorCode, errors?: any) {
      super(message, errorCode, 400, errors);
    }
  }
  
  export class UnauthorizedException extends HttpException {
    constructor(message: string, errorCode: ErrorCode) {
      super(message, errorCode, 401);
    }
  }
  
  export class ForbiddenException extends HttpException {
    constructor(message: string, errorCode: ErrorCode) {
      super(message, errorCode, 403);
    }
  }
  
  export class NotFoundException extends HttpException {
    constructor(message: string, errorCode: ErrorCode) {
      super(message, errorCode, 404);
    }
  }
  
  export class InternalException extends HttpException {
    constructor(message: string, errorCode: ErrorCode) {
      super(message, errorCode, 500);
    }
  }
  
  