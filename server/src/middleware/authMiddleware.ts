/**
 * Authentication Middleware
 * Protects routes by verifying JWT access tokens
 */

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/index.js';
import { verifyAccessToken } from '../services/tokenService.js';
import { AppError } from '../utils/AppError.js';

/**
 * Middleware to verify JWT access token
 * Extracts token from Authorization header and verifies it
 */
export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided. Please login to access this resource', 401);
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new AppError('No token provided. Please login to access this resource', 401);
    }

    // 2. Verify token
    const decoded = verifyAccessToken(token);

    // 3. Attach user info to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error: any) {
    // Handle specific token errors
    if (error.message.includes('expired')) {
      next(new AppError('Your token has expired. Please login again', 401));
    } else if (error.message.includes('invalid')) {
      next(new AppError('Invalid token. Please login again', 401));
    } else {
      next(error);
    }
  }
};

/**
 * Middleware to restrict access to specific roles
 * Use after protect middleware
 */
export const restrictTo = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('User not authenticated', 401));
    }

    if (!roles.includes(req.user.role || 'user')) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };
};

/**
 * Optional authentication middleware
 * Attaches user if token is valid, but doesn't fail if no token
 */
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      
      if (token) {
        const decoded = verifyAccessToken(token);
        req.user = {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role,
        };
      }
    }
    
    next();
  } catch (error) {
    // Don't throw error, just continue without user
    next();
  }
};
