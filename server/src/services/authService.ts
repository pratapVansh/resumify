/**
 * Authentication Service
 * Handles business logic for user authentication
 */

import User, { IUser } from '../models/User.js';
import { RegisterUserDto, LoginUserDto, GoogleProfile, TokenPair, JwtPayload } from '../types/index.js';
import { generateTokenPair } from './tokenService.js';
import { AppError } from '../utils/AppError.js';

/**
 * Register a new user with email and password
 */
export const registerUser = async (userData: RegisterUserDto): Promise<{ user: IUser; tokens: TokenPair }> => {
  const { email, password, firstName, lastName } = userData;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('User with this email already exists', 409);
  }

  // Create new user
  const user = await User.create({
    email,
    password,
    firstName,
    lastName,
    isEmailVerified: false,
  });

  // Generate tokens
  const payload: JwtPayload = {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  };
  const tokens = generateTokenPair(payload);

  // Get user with refreshTokens field to add token
  const userWithTokens = await User.findById(user._id).select('+refreshTokens');
  if (userWithTokens) {
    await userWithTokens.addRefreshToken(tokens.refreshToken);
  }

  // Remove password from response
  user.password = undefined;

  return { user, tokens };
};

/**
 * Login user with email and password
 */
export const loginUser = async (credentials: LoginUserDto): Promise<{ user: IUser; tokens: TokenPair }> => {
  const { email, password } = credentials;

  // Find user and include password field
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  // Check if user has a password (not OAuth-only user)
  if (!user.password) {
    throw new AppError('You have logged in with Google OAuth. You cannot login through email. To login through email, set a password first.', 401);
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  // Generate tokens
  const payload: JwtPayload = {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  };
  const tokens = generateTokenPair(payload);

  // Get user with refreshTokens field to add token (since select: false)
  const userWithTokens = await User.findById(user._id).select('+refreshTokens');
  if (userWithTokens) {
    await userWithTokens.addRefreshToken(tokens.refreshToken);
  }

  // Remove password from response
  user.password = undefined;

  return { user, tokens };
};

/**
 * Handle Google OAuth login/registration
 */
export const googleAuth = async (profile: GoogleProfile): Promise<{ user: IUser; tokens: TokenPair; isNewUser: boolean }> => {
  const { id, email, firstName, lastName, picture } = profile;

  // Check if user exists with Google ID
  let user = await User.findOne({ googleId: id });
  let isNewUser = false;

  if (!user) {
    // Check if user exists with email (link accounts)
    user = await User.findOne({ email });

    if (user) {
      // Link Google account to existing user
      user.googleId = id;
      if (picture) user.avatar = picture;
      user.isEmailVerified = true; // Google email is verified
      await user.save();
    } else {
      // Create new user
      user = await User.create({
        email,
        googleId: id,
        firstName,
        lastName,
        avatar: picture,
        isEmailVerified: true,
      });
      isNewUser = true;
    }
  }

  // Generate tokens
  const payload: JwtPayload = {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  };
  const tokens = generateTokenPair(payload);

  // Save refresh token to user
  await user.addRefreshToken(tokens.refreshToken);

  return { user, tokens, isNewUser };
};

/**
 * Refresh access token using refresh token
 */
export const refreshAccessToken = async (refreshToken: string): Promise<TokenPair> => {
  // Find user with this refresh token
  const user = await User.findOne({ refreshTokens: refreshToken }).select('+refreshTokens');
  
  if (!user) {
    throw new AppError('Invalid refresh token', 401);
  }

  // Generate new token pair
  const payload: JwtPayload = {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  };
  const tokens = generateTokenPair(payload);

  // Remove old refresh token and add new one
  await user.removeRefreshToken(refreshToken);
  await user.addRefreshToken(tokens.refreshToken);

  return tokens;
};

/**
 * Logout user (remove refresh token)
 */
export const logoutUser = async (userId: string, refreshToken: string): Promise<void> => {
  const user = await User.findById(userId).select('+refreshTokens');
  
  if (user) {
    await user.removeRefreshToken(refreshToken);
  }
};

/**
 * Logout from all devices (clear all refresh tokens)
 */
export const logoutAllDevices = async (userId: string): Promise<void> => {
  const user = await User.findById(userId).select('+refreshTokens');
  
  if (user) {
    await user.clearRefreshTokens();
  }
};
