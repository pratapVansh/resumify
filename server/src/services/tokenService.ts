/**
 * Token Service
 * Handles JWT token generation, verification, and management
 */

import jwt from 'jsonwebtoken';
import { JwtPayload, TokenPair } from '../types/index.js';

/**
 * Get JWT secrets from environment variables
 */
const getSecrets = () => {
  const accessSecret = process.env.JWT_ACCESS_SECRET;
  const refreshSecret = process.env.JWT_REFRESH_SECRET;

  if (!accessSecret || !refreshSecret) {
    throw new Error('JWT secrets are not defined in environment variables');
  }

  return { accessSecret, refreshSecret };
};

/**
 * Generate access token (short-lived)
 */
export const generateAccessToken = (payload: JwtPayload): string => {
  const { accessSecret } = getSecrets();
  const expiresIn = process.env.JWT_ACCESS_EXPIRES_IN || '15m';

  // @ts-ignore
  return jwt.sign(payload, accessSecret, {
    expiresIn,
    issuer: 'resumify',
  });
};

/**
 * Generate refresh token (long-lived)
 */
export const generateRefreshToken = (payload: JwtPayload): string => {
  const { refreshSecret } = getSecrets();
  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

  // @ts-ignore
  return jwt.sign(payload, refreshSecret, {
    expiresIn,
    issuer: 'resumify',
  });
};

/**
 * Generate both access and refresh tokens
 */
export const generateTokenPair = (payload: JwtPayload): TokenPair => {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};

/**
 * Verify access token
 */
export const verifyAccessToken = (token: string): JwtPayload => {
  const { accessSecret } = getSecrets();

  try {
    const decoded = jwt.verify(token, accessSecret, {
      issuer: 'resumify',
    }) as JwtPayload;
    
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Access token has expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid access token');
    }
    throw error;
  }
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token: string): JwtPayload => {
  const { refreshSecret } = getSecrets();

  try {
    const decoded = jwt.verify(token, refreshSecret, {
      issuer: 'resumify',
    }) as JwtPayload;
    
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Refresh token has expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid refresh token');
    }
    throw error;
  }
};

/**
 * Decode token without verification (for debugging)
 */
export const decodeToken = (token: string): JwtPayload | null => {
  try {
    return jwt.decode(token) as JwtPayload;
  } catch (error) {
    return null;
  }
};
