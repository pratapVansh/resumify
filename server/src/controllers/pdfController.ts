import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { generateResumePDF, generateAndUploadResumePDF } from '../services/pdfService.js';
import { uploadResumeFile } from '../services/uploadService.js';
import Resume from '../models/Resume.js';

/**
 * @desc    Generate and download resume as PDF
 * @route   GET /api/pdf/resume/:resumeId/download
 * @access  Private
 */
export const downloadResumePDF = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { resumeId } = req.params;

    // Find resume and verify ownership
    const authReq = req as AuthRequest;
    const resume = await Resume.findOne({ _id: resumeId, user: authReq.user!.id });
    
    if (!resume) {
      return next(new AppError('Resume not found', 404));
    }

    // Generate PDF
    const pdfBuffer = await generateResumePDF(resume);

    // Set headers for download
    const fileName = `${resume.personalInfo.firstName}_${resume.personalInfo.lastName}_Resume.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // Send PDF buffer
    res.send(pdfBuffer);
  }
);

/**
 * @desc    Generate resume PDF and get URL (for preview)
 * @route   GET /api/pdf/resume/:resumeId/preview
 * @access  Private
 */
export const previewResumePDF = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { resumeId } = req.params;

    // Find resume and verify ownership
    const authReq = req as AuthRequest;
    const resume = await Resume.findOne({ _id: resumeId, user: authReq.user!.id });
    
    if (!resume) {
      return next(new AppError('Resume not found', 404));
    }

    // Generate PDF
    const pdfBuffer = await generateResumePDF(resume);

    // Set headers for inline display
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Content-Length', pdfBuffer.length);

    // Send PDF buffer
    res.send(pdfBuffer);
  }
);

/**
 * @desc    Generate and upload resume PDF to Cloudinary
 * @route   POST /api/pdf/resume/:resumeId/upload
 * @access  Private
 */
export const generateAndUploadPDF = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { resumeId } = req.params;

    // Find resume and verify ownership
    const authReq = req as AuthRequest;
    const resume = await Resume.findOne({ _id: resumeId, user: authReq.user!.id });
    
    if (!resume) {
      return next(new AppError('Resume not found', 404));
    }

    // Generate and upload PDF
    const result = await generateAndUploadResumePDF(resume, uploadResumeFile);

    // Update resume with PDF URL and thumbnail URL
    resume.pdfUrl = result.url;
    resume.pdfPublicId = result.publicId;
    // resume.thumbnailUrl = result.thumbnailUrl; // TODO: Add thumbnail generation
    await resume.save();

    res.status(200).json({
      status: 'success',
      data: {
        url: result.url,
        publicId: result.publicId,
        // thumbnailUrl: result.thumbnailUrl, // TODO: Add thumbnail generation
      },
    });
  }
);

/**
 * @desc    Download public resume by share ID
 * @route   GET /api/pdf/resume/share/:shareId
 * @access  Public
 */
export const downloadPublicResume = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { shareId } = req.params;

    // Find public resume by share ID
    const resume = await Resume.findOne({ shareId, visibility: 'public' });
    
    if (!resume) {
      return next(new AppError('Resume not found or not public', 404));
    }

    // Generate PDF
    const pdfBuffer = await generateResumePDF(resume);

    // Set headers for download
    const fileName = `${resume.personalInfo.firstName}_${resume.personalInfo.lastName}_Resume.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // Send PDF buffer
    res.send(pdfBuffer);
  }
);
