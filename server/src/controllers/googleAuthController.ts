/**
 * Google OAuth Controller
 * Handles Google OAuth authentication flow
 */

import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { IUser } from '../models/User.js';
import { generateTokenPair } from '../services/tokenService.js';
import { JwtPayload } from '../types/index.js';

/**
 * @route   GET /api/auth/google
 * @desc    Initiate Google OAuth flow
 * @access  Public
 */
export const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false,
});

/**
 * @route   GET /api/auth/google/callback
 * @desc    Google OAuth callback
 * @access  Public
 */
export const googleCallback = [
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=google_auth_failed`,
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as IUser;

      if (!user) {
        console.error('Google OAuth: No user found in request');
        return res.redirect(`${process.env.CLIENT_URL}/login?error=no_user`);
      }

      console.log('Google OAuth: User authenticated:', user.email);

      // Generate tokens
      const payload: JwtPayload = {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      };
      const tokens = generateTokenPair(payload);

      // Get user with refreshTokens field (since it's select: false by default)
      const User = (await import('../models/User.js')).default;
      const userWithTokens = await User.findById(user._id).select('+refreshTokens');

      if (!userWithTokens) {
        console.error('Google OAuth: User not found in database');
        return res.redirect(`${process.env.CLIENT_URL}/login?error=user_not_found`);
      }

      // Save refresh token to user
      await userWithTokens.addRefreshToken(tokens.refreshToken);

      // Set refresh token in HTTP-only cookie
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Redirect to frontend with access token
      const redirectUrl = `${process.env.CLIENT_URL}/auth/callback?token=${tokens.accessToken}`;
      console.log('Google OAuth: Redirecting to:', redirectUrl);
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.redirect(`${process.env.CLIENT_URL}/login?error=callback_failed`);
    }
  },
];
