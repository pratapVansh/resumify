/**
 * Type definitions for the application
 */

import { Request } from 'express';

/**
 * Extend Express Request interface to include authenticated user
 */
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role?: string;
  };
  file?: Express.Multer.File;
  files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] };
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
