import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

// Interface for custom error with status code
interface CustomError extends Error {
  statusCode?: number;
  code?: number;
  keyValue?: any;
  errors?: any;
}

// Error handler middleware
export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', err);

  // Default error status and message
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Server Error';
  let errors: any = null;

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError' && err.errors) {
    statusCode = 400;
    message = 'Validation Error';
    errors = Object.values(err.errors).map((val: any) => val.message);
  }

  // Handle Mongoose duplicate key errors
  if (err.code === 11000 && err.keyValue) {
    statusCode = 400;
    message = 'Duplicate field value entered';
    errors = err.keyValue;
  }

  // Handle Mongoose cast errors (invalid ID)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Resource not found or invalid ID';
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// Not found middleware
export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  const error: CustomError = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

// Async handler to avoid try-catch blocks in controllers
export const asyncHandler = (fn: Function) => (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  return Promise.resolve(fn(req, res, next)).catch(next);
};
