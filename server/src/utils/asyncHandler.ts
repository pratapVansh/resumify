/**
 * Async Handler Utility
 * Wraps async route handlers to catch errors and pass them to error middleware
 */

import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Wraps async functions to catch errors
 */
export const asyncHandler = (fn: RequestHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
