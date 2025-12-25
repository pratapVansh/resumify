/**
 * Authentication Controller
 * Handles HTTP requests for authentication endpoints
 */

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/index.js';
import * as authService from '../services/authService.js';
import { verifyRefreshToken } from '../services/tokenService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
export const register = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { email, password, firstName, lastName } = req.body;

  // Register user
  const { user, tokens } = await authService.registerUser({
    email,
    password,
    firstName,
    lastName,
  });

  // Set refresh token in HTTP-only cookie
  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  // Send response
  res.status(201).json({
    status: 'success',
    message: 'User registered successfully',
    data: {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      accessToken: tokens.accessToken,
    },
  });
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user with email and password
 * @access  Public
 */
export const login = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  // Login user
  const { user, tokens } = await authService.loginUser({ email, password });

  // Set refresh token in HTTP-only cookie
  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  // Send response
  res.status(200).json({
    status: 'success',
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      accessToken: tokens.accessToken,
    },
  });
});

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public
 */
export const refreshToken = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  // Get refresh token from cookie or body
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!refreshToken) {
    throw new AppError('No refresh token provided', 401);
  }

  // Verify refresh token first
  try {
    verifyRefreshToken(refreshToken);
  } catch (error: any) {
    throw new AppError(error.message, 401);
  }

  // Get new tokens
  const tokens = await authService.refreshAccessToken(refreshToken);

  // Set new refresh token in cookie
  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/', // Ensure cookie is accessible from all routes
  });

  // Send response
  res.status(200).json({
    status: 'success',
    message: 'Token refreshed successfully',
    data: {
      accessToken: tokens.accessToken,
    },
  });
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (remove refresh token)
 * @access  Private
 */
export const logout = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError('User not authenticated', 401);
  }

  if (refreshToken) {
    await authService.logoutUser(userId, refreshToken);
  }

  // Clear refresh token cookie
  res.clearCookie('refreshToken');

  res.status(200).json({
    status: 'success',
    message: 'Logout successful',
  });
});

/**
 * @route   POST /api/auth/logout-all
 * @desc    Logout from all devices
 * @access  Private
 */
export const logoutAll = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError('User not authenticated', 401);
  }

  await authService.logoutAllDevices(userId);

  // Clear refresh token cookie
  res.clearCookie('refreshToken');

  res.status(200).json({
    status: 'success',
    message: 'Logged out from all devices successfully',
  });
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
export const getMe = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError('User not authenticated', 401);
  }

  const User = (await import('../models/User.js')).default;
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
      },
    },
  });
});
