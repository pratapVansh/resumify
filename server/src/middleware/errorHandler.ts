/**
 * Error Handling Middleware
 * Centralized error handling for the application
 */

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError.js';

/**
 * Interface for error with statusCode
 */
interface ErrorWithStatus extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
  code?: number;
  keyValue?: any;
  errors?: any;
  path?: string;
  value?: any;
}

/**
 * Handle MongoDB duplicate key errors
 */
const handleDuplicateKeyError = (error: ErrorWithStatus): AppError => {
  const field = Object.keys(error.keyValue || {})[0];
  const message = `${field} already exists. Please use a different ${field}.`;
  return new AppError(message, 409);
};

/**
 * Handle MongoDB validation errors
 */
const handleValidationError = (error: ErrorWithStatus): AppError => {
  const errors = Object.values(error.errors || {}).map((err: any) => err.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

/**
 * Handle MongoDB cast errors
 */
const handleCastError = (error: ErrorWithStatus): AppError => {
  const message = `Invalid ${error.path}: ${error.value}`;
  return new AppError(message, 400);
};

/**
 * Send error response in development mode
 */
const sendErrorDev = (error: ErrorWithStatus, res: Response): void => {
  console.error('❌ Error in development:', error.message);
  console.error('Stack:', error.stack);
  res.status(error.statusCode || 500).json({
    status: error.status || 'error',
    message: error.message,
    error: error,
    stack: error.stack,
  });
};

/**
 * Send error response in production mode
 */
const sendErrorProd = (error: ErrorWithStatus, res: Response): void => {
  // Operational, trusted error: send message to client
  if (error.isOperational) {
    res.status(error.statusCode || 500).json({
      status: error.status || 'error',
      message: error.message,
    });
  } else {
    // Programming or unknown error: don't leak error details
    console.error('ERROR 💥:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
    });
  }
};

/**
 * Global error handling middleware
 */
export const errorHandler = (
  err: ErrorWithStatus,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err, message: err.message, name: err.name };

    // Handle specific MongoDB errors
    if (error.code === 11000) {
      error = handleDuplicateKeyError(error);
    }
    if (error.name === 'ValidationError') {
      error = handleValidationError(error);
    }
    if (error.name === 'CastError') {
      error = handleCastError(error);
    }

    sendErrorProd(error, res);
  }
};

/**
 * Handle 404 errors for undefined routes
 */
export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  const error = new AppError(`Cannot find ${req.originalUrl} on this server`, 404);
  next(error);
};
