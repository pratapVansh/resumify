/**
 * Type definitions for the application
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Extend Express Request interface to include authenticated user
 * This interface properly inherits all Express Request properties
 */
export interface AuthRequest<
  P = any,
  ResBody = any,
  ReqBody = any,
  ReqQuery = any,
  Locals extends Record<string, any> = Record<string, any>
> extends Request<P, ResBody, ReqBody, ReqQuery, Locals> {
  user?: {
    id: string;
    email: string;
    role?: string;
  };
}

/**
 * User registration data
 */
export interface RegisterUserDto {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

/**
 * User login data
 */
export interface LoginUserDto {
  email: string;
  password: string;
}

/**
 * JWT token payload
 */
export interface JwtPayload {
  id: string;
  email: string;
  role?: string;
}

/**
 * Token pair response
 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Google OAuth profile
 */
export interface GoogleProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  picture?: string;
}
