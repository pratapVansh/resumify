/**
 * Resume Controller
 * Handles HTTP requests for resume endpoints
 */

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/index.js';
import * as resumeService from '../services/resumeService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { generateAndUploadResumePDF } from '../services/pdfService.js';
import { uploadResumeFile } from '../services/uploadService.js';

/**
 * @route   POST /api/resumes
 * @desc    Create a new resume
 * @access  Private
 */
export const createResume = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    console.log('📝 Creating resume for user:', userId);
    console.log('📄 Resume data received:', JSON.stringify(req.body, null, 2));

    const resume = await resumeService.createResume(userId, req.body);

    console.log('✅ Resume created successfully:', resume._id);

    // Generate and upload PDF to Cloudinary in the background
    generateAndUploadResumePDF(resume, uploadResumeFile, userId)
      .then(result => {
        console.log('\n🎉 PDF GENERATION & UPLOAD COMPLETE');
        console.log('══════════════════════════════════');
        console.log('📄 Download URL (RAW):', result.url);
        console.log('🖼️  Preview URL (JPG):', result.previewUrl);
        console.log('👁️  View URL (PDF):', result.viewPdfUrl);
        console.log('🆔 Public ID:', result.publicId);
        console.log('══════════════════════════════════\n');
        
        console.log('💾 Updating resume in database with Cloudinary URLs...');
        // Update resume with all URLs
        resumeService.updateResume(resume._id.toString(), userId, {
          pdfUrl: result.url,              // RAW download URL
          pdfPublicId: result.publicId,
          thumbnailUrl: result.previewUrl, // Legacy field
          previewUrl: result.previewUrl,   // JPG preview
          viewPdfUrl: result.viewPdfUrl,   // PDF view URL
        } as any)
          .then(() => console.log('✅ Database updated successfully with PDF and thumbnail URLs'))
          .catch(err => console.error('❌ Failed to update PDF URL:', err));
      })
      .catch(err => console.error('❌ Failed to generate PDF:', err));

    res.status(201).json({
      status: 'success',
      message: 'Resume created successfully',
      data: {
        resume,
      },
    });
  }
);

/**
 * @route   GET /api/resumes
 * @desc    Get all resumes for logged-in user
 * @access  Private
 */
export const getMyResumes = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    const resumes = await resumeService.getUserResumes(userId);
    const count = resumes.length;

    // Add thumbnail URLs to each resume
    const resumesWithThumbnails = resumes.map(resume => ({
      ...resume.toObject(),
      thumbnailUrl: resume.getThumbnailUrl ? resume.getThumbnailUrl() : '',
    }));

    res.status(200).json({
      status: 'success',
      results: count,
      data: {
        resumes: resumesWithThumbnails,
      },
    });
  }
);

/**
 * @route   GET /api/resumes/:id
 * @desc    Get a single resume by ID
 * @access  Private
 */
export const getResume = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const resumeId = req.params.id;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    const resume = await resumeService.getResumeById(resumeId, userId);

    res.status(200).json({
      status: 'success',
      data: {
        resume: {
          ...resume.toObject(),
          thumbnailUrl: resume.getThumbnailUrl ? resume.getThumbnailUrl() : '',
        },
      },
    });
  }
);

/**
 * @route   PUT /api/resumes/:id
 * @desc    Update a resume
 * @access  Private
 */
export const updateResume = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const resumeId = req.params.id;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    console.log('📝 Updating resume:', resumeId, 'for user:', userId);
    console.log('📄 Update data received:', JSON.stringify(req.body, null, 2));

    const resume = await resumeService.updateResume(resumeId, userId, req.body);

    console.log('✅ Resume updated successfully:', resume._id);

    // Generate and upload PDF to Cloudinary in the background
    generateAndUploadResumePDF(resume, uploadResumeFile, userId)
      .then(result => {
        console.log('📄 PDF regenerated and uploaded');
        // Update resume with all URLs
        resumeService.updateResume(resume._id.toString(), userId, {
          pdfUrl: result.url,              // RAW download URL
          pdfPublicId: result.publicId,
          thumbnailUrl: result.previewUrl, // Legacy field
          previewUrl: result.previewUrl,   // JPG preview
          viewPdfUrl: result.viewPdfUrl,   // PDF view URL
        } as any).catch(err => console.error('Failed to update PDF URL:', err));
      })
      .catch(err => console.error('Failed to generate PDF:', err));

    res.status(200).json({
      status: 'success',
      message: 'Resume updated successfully',
      data: {
        resume,
      },
    });
  }
);

/**
 * @route   DELETE /api/resumes/:id
 * @desc    Delete a resume
 * @access  Private
 */
export const deleteResume = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const resumeId = req.params.id;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    await resumeService.deleteResume(resumeId, userId);

    res.status(200).json({
      status: 'success',
      message: 'Resume deleted successfully',
    });
  }
);

/**
 * @route   GET /api/resumes/public/:shareId
 * @desc    Get a public resume by share ID
 * @access  Public
 */
export const getPublicResume = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const shareId = req.params.shareId;

    const resume = await resumeService.getPublicResume(shareId);

    res.status(200).json({
      status: 'success',
      data: {
        resume,
      },
    });
  }
);

/**
 * @route   PATCH /api/resumes/:id/visibility
 * @desc    Toggle resume visibility (public/private)
 * @access  Private
 */
export const toggleVisibility = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const resumeId = req.params.id;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    const resume = await resumeService.toggleVisibility(resumeId, userId);

    res.status(200).json({
      status: 'success',
      message: `Resume is now ${resume.visibility}`,
      data: {
        resume,
      },
    });
  }
);

/**
 * @route   PATCH /api/resumes/:id/regenerate-share-id
 * @desc    Regenerate share ID for a resume
 * @access  Private
 */
export const regenerateShareId = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const resumeId = req.params.id;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    const resume = await resumeService.regenerateShareId(resumeId, userId);

    res.status(200).json({
      status: 'success',
      message: 'Share ID regenerated successfully',
      data: {
        resume,
      },
    });
  }
);

/**
 * @route   POST /api/resumes/:id/duplicate
 * @desc    Duplicate a resume
 * @access  Private
 */
export const duplicateResume = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const resumeId = req.params.id;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    const resume = await resumeService.duplicateResume(resumeId, userId);

    res.status(201).json({
      status: 'success',
      message: 'Resume duplicated successfully',
      data: {
        resume,
      },
    });
  }
);

/**
 * @route   GET /api/resumes/stats/count
 * @desc    Get resume count for user
 * @access  Private
 */
export const getResumeStats = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    const count = await resumeService.getResumeCount(userId);

    res.status(200).json({
      status: 'success',
      data: {
        totalResumes: count,
      },
    });
  }
);
