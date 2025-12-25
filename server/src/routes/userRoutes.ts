/**
 * User Routes
 * Handles user profile management
 */

import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { uploadImage } from '../middleware/upload.js';
import { uploadProfilePhoto, deleteFromCloudinary } from '../services/uploadService.js';
import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { AuthRequest } from '../types/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

/**
 * @route   POST /api/users/profile/photo
 * @desc    Upload user profile photo
 * @access  Private
 */
router.post('/profile/photo', protect, uploadImage.single('photo'), asyncHandler(async (req: AuthRequest, res) => {
  if (!req.file) {
    throw new AppError('No file uploaded', 400);
  }

  if (!req.file.mimetype.startsWith('image/')) {
    throw new AppError('Please upload an image file', 400);
  }

  // Upload to Cloudinary
  const result = await uploadProfilePhoto(
    req.file.buffer,
    req.user!.id
  );

  // Delete old profile photo if exists
  const user = await User.findById(req.user!.id);
  if (user?.profilePhotoPublicId) {
    await deleteFromCloudinary(user.profilePhotoPublicId, 'image').catch(err => {
      console.error('Failed to delete old photo:', err);
    });
  }

  // Update user profile with new photo URL
  const updatedUser = await User.findByIdAndUpdate(
    req.user!.id,
    {
      profilePhoto: result.url,
      profilePhotoPublicId: result.publicId
    },
    { new: true }
  );

  res.status(200).json({
    success: true,
    message: 'Profile photo uploaded successfully',
    data: {
      photoUrl: result.url,
      user: {
        id: updatedUser!._id,
        email: updatedUser!.email,
        firstName: updatedUser!.firstName,
        lastName: updatedUser!.lastName,
        profilePhoto: updatedUser!.profilePhoto,
      }
    }
  });
}));

/**
 * @route   DELETE /api/users/profile/photo
 * @desc    Delete user profile photo
 * @access  Private
 */
router.delete('/profile/photo', protect, asyncHandler(async (req: AuthRequest, res) => {
  const user = await User.findById(req.user!.id);
  
  if (!user?.profilePhotoPublicId) {
    throw new AppError('No profile photo to delete', 404);
  }

  // Delete from Cloudinary
  await deleteFromCloudinary(user.profilePhotoPublicId, 'image');

  // Update user profile
  const updatedUser = await User.findByIdAndUpdate(
    req.user!.id,
    {
      $unset: { profilePhoto: '', profilePhotoPublicId: '' }
    },
    { new: true }
  );

  res.status(200).json({
    success: true,
    message: 'Profile photo deleted successfully',
    data: {
      user: {
        id: updatedUser!._id,
        email: updatedUser!.email,
        firstName: updatedUser!.firstName,
        lastName: updatedUser!.lastName,
      }
    }
  });
}));

/**
 * @route   GET /api/users/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get('/profile', protect, asyncHandler(async (req: AuthRequest, res) => {
  const user = await User.findById(req.user!.id);
  
  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePhoto: user.profilePhoto,
        avatar: user.avatar,
        createdAt: user.createdAt,
      }
    }
  });
}));

/**
 * @route   PATCH /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.patch('/profile', protect, asyncHandler(async (req: AuthRequest, res) => {
  const { firstName, lastName } = req.body;
  
  const updatedUser = await User.findByIdAndUpdate(
    req.user!.id,
    { firstName, lastName },
    { new: true, runValidators: true }
  );

  if (!updatedUser) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        profilePhoto: updatedUser.profilePhoto,
      }
    }
  });
}));

export default router;
