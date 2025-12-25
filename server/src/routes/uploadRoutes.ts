import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { uploadImage, uploadPDF } from '../middleware/upload.js';
import * as uploadController from '../controllers/uploadController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

/**
 * @route   POST /api/upload/profile-photo
 * @desc    Upload profile photo
 * @access  Private
 */
router.post(
  '/profile-photo',
  uploadImage.single('photo'),
  uploadController.uploadProfilePhotoHandler
);

/**
 * @route   POST /api/upload/resume-file/:resumeId
 * @desc    Upload resume file
 * @access  Private
 */
router.post(
  '/resume-file/:resumeId',
  uploadPDF.single('file'),
  uploadController.uploadResumeFileHandler
);

/**
 * @route   DELETE /api/upload/:publicId
 * @desc    Delete file from Cloudinary
 * @access  Private
 */
router.delete('/:publicId', uploadController.deleteFileHandler);

export default router;
