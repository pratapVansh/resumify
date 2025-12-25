/**
 * Authentication Routes
 * Defines all authentication-related endpoints
 */

import express from 'express';
import * as authController from '../controllers/authController.js';
import * as googleAuthController from '../controllers/googleAuthController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateRegister, validateLogin, validateRefreshToken } from '../middleware/validation.js';

const router = express.Router();

/**
 * Public routes
 */

// Register new user
router.post('/register', validateRegister, authController.register);

// Login user
router.post('/login', validateLogin, authController.login);

// Refresh access token
router.post('/refresh', authController.refreshToken);

// Google OAuth routes
router.get('/google', googleAuthController.googleAuth);
router.get('/google/callback', googleAuthController.googleCallback);

/**
 * Protected routes (require authentication)
 */

// Get current user profile
router.get('/me', protect, authController.getMe);

// Logout from current device
router.post('/logout', protect, authController.logout);

// Logout from all devices
router.post('/logout-all', protect, authController.logoutAll);

export default router;
