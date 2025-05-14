import { Request, Response, NextFunction } from 'express';
import { HttpException, ErrorCode, InternalException, UnauthorizedException, BadRequestsException, NotFoundException } from '../exceptions/root';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log error for debugging
  console.error('Error:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
  });

  // Handle Prisma errors
  if (err instanceof PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        // Unique constraint violation
        res.status(409).json({
          message: 'A record with this value already exists',
          errorCode: ErrorCode.USER_ALREADY_EXISTS,
          statusCode: 409
        });
        return;
      case 'P2025':
        // Record not found
        res.status(404).json({
          message: 'Record not found',
          errorCode: ErrorCode.USER_NOT_FOUND,
          statusCode: 404
        });
        return;
      case 'P2003':
        // Foreign key constraint violation
        res.status(400).json({
          message: 'Referenced record does not exist',
          errorCode: ErrorCode.INVALID_INPUT,
          statusCode: 400
        });
        return;
      default:
        res.status(500).json({
          message: 'Database error',
          errorCode: ErrorCode.INTERNAL_EXCEPTION,
          statusCode: 500
        });
        return;
    }
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      message: 'Invalid token',
      errorCode: ErrorCode.INVALID_TOKEN,
      statusCode: 401
    });
    return;
  }
  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      message: 'Token expired',
      errorCode: ErrorCode.TOKEN_EXPIRED,
      statusCode: 401
    });
    return;
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    const message = Object.values((err as any).errors).map((val: any) => val.message);
    res.status(422).json({
      message: message.join(', '),
      errorCode: ErrorCode.UNPROCESSABLE_ENTITY,
      statusCode: 422,
      errors: (err as any).errors
    });
    return;
  }

  // Handle custom HttpException
  if (err instanceof HttpException) {
    res.status(err.statusCode).json({
      message: err.message,
      errorCode: err.errorCode,
      statusCode: err.statusCode,
      ...(err.errors && { errors: err.errors })
    });
    return;
  }

  // Handle unknown errors
  res.status(500).json({
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    errorCode: ErrorCode.INTERNAL_EXCEPTION,
    statusCode: 500
  });
};

// Handle 404 errors
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  next(new NotFoundException(`Can't find ${req.originalUrl} on this server!`, ErrorCode.USER_NOT_FOUND));
};

// Handle async errors
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
}; 