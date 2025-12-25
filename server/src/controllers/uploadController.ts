import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import {
  uploadProfilePhoto,
  uploadResumeFile,
  deleteFromCloudinary,
  isValidImageType,
  isValidFileSize,
} from '../services/uploadService.js';
import Resume from '../models/Resume.js';

// Extend Request type for file uploads
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

/**
 * @desc    Upload profile photo
 * @route   POST /api/upload/profile-photo
 * @access  Private
 */
export const uploadProfilePhotoHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const multerReq = req as MulterRequest;
    
    if (!multerReq.file) {
      return next(new AppError('Please upload a file', 400));
    }

    // Validate file type
    if (!isValidImageType(multerReq.file.mimetype)) {
      return next(new AppError('Only image files (JPEG, PNG, WebP, GIF) are allowed', 400));
    }

    // Validate file size (5MB)
    if (!isValidFileSize(multerReq.file.size, 5)) {
      return next(new AppError('File size must be less than 5MB', 400));
    }

    // Upload to Cloudinary
    const authReq = req as AuthRequest;
    const result = await uploadProfilePhoto(multerReq.file.buffer, authReq.user!.id);

    res.status(200).json({
      status: 'success',
      data: {
        url: result.url,
        publicId: result.publicId,
        width: result.width,
        height: result.height,
      },
    });
  }
);

/**
 * @desc    Upload resume file (for storing uploaded PDFs)
 * @route   POST /api/upload/resume-file/:resumeId
 * @access  Private
 */
export const uploadResumeFileHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { resumeId } = req.params;
    const multerReq = req as MulterRequest;

    if (!multerReq.file) {
      return next(new AppError('Please upload a file', 400));
    }

    // Validate file size (10MB)
    if (!isValidFileSize(multerReq.file.size, 10)) {
      return next(new AppError('File size must be less than 10MB', 400));
    }

    // Verify resume exists and belongs to user
    const authReq = req as AuthRequest;
    const resume = await Resume.findOne({ _id: resumeId, user: authReq.user!.id });
    if (!resume) {
      return next(new AppError('Resume not found', 404));
    }

    // Upload to Cloudinary
    const result = await uploadResumeFile(multerReq.file.buffer, resumeId);

    // Update resume with PDF URL
    resume.pdfUrl = result.url;
    resume.pdfPublicId = result.publicId;
    await resume.save();

    res.status(200).json({
      status: 'success',
      data: {
        url: result.url,
        publicId: result.publicId,
        format: result.format,
      },
    });
  }
);

/**
 * @desc    Delete uploaded file from Cloudinary
 * @route   DELETE /api/upload/:publicId
 * @access  Private
 */
export const deleteFileHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { publicId } = req.params;
    const { resourceType } = req.query;

    if (!publicId) {
      return next(new AppError('Public ID is required', 400));
    }

    // Delete from Cloudinary
    await deleteFromCloudinary(
      publicId,
      (resourceType as 'image' | 'raw' | 'video') || 'image'
    );

    res.status(200).json({
      status: 'success',
      message: 'File deleted successfully',
    });
  }
);
