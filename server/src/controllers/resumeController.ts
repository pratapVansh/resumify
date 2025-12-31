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
import mammoth from 'mammoth';
import { parseResumeText } from '../services/aiService.js';
import { extractTextFromPDF } from '../utils/pdfParser.js';

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

/**
 * @route   POST /api/resumes/parse
 * @desc    Parse uploaded resume file (PDF or DOCX)
 * @access  Private
 */
export const parseResume = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    // Check if file was uploaded
    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    const file = req.file;

    console.log('📄 Parsing resume file:', {
      filename: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      userId,
    });

    // Validate file type (already handled by multer filter, but double-check)
    const allowedMimeTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new AppError('Unsupported file format. Only PDF and DOCX files are allowed', 400);
    }

    let extractedText = '';

    try {
      // Detect file type and extract text accordingly
      if (file.mimetype === 'application/pdf') {
        console.log('📖 Extracting text from PDF...');
        const pdfData = await extractTextFromPDF(file.buffer);
        extractedText = pdfData.text;
        console.log(`✅ Extracted ${pdfData.numpages} pages from PDF`);
      } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        console.log('📖 Extracting text from DOCX...');
        const result = await mammoth.extractRawText({ buffer: file.buffer });
        extractedText = result.value;
        if (result.messages.length > 0) {
          console.log('⚠️  DOCX extraction warnings:', result.messages);
        }
        console.log('✅ Extracted text from DOCX');
      }

      // Clean extracted text
      extractedText = cleanExtractedText(extractedText);

      if (!extractedText || extractedText.trim().length === 0) {
        throw new AppError('No text could be extracted from the file. The file may be empty or contain only images.', 400);
      }

      console.log(`✅ Resume parsed successfully. Extracted ${extractedText.length} characters`);

      // Parse extracted text using Gemini AI
      console.log('🤖 Sending text to Gemini for structured parsing...');
      const parsedResumeData = await parseResumeText(extractedText);

      res.status(200).json({
        status: 'success',
        data: {
          filename: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          extractedText,
          characterCount: extractedText.length,
          wordCount: extractedText.split(/\s+/).filter(word => word.length > 0).length,
          parsedData: parsedResumeData,
        },
      });
    } catch (error: any) {
      console.error('❌ Error parsing resume:', error);
      
      // Handle specific parsing errors
      if (error.message?.includes('PDF') || error.message?.includes('password')) {
        throw new AppError('Failed to parse PDF file. The file may be corrupted or password-protected.', 400);
      } else if (error.message?.includes('DOCX') || error.message?.includes('zip')) {
        throw new AppError('Failed to parse DOCX file. The file may be corrupted.', 400);
      } else if (error instanceof AppError) {
        throw error;
      } else {
        throw new AppError('An error occurred while parsing the resume file.', 500);
      }
    }
  }
);

/**
 * Clean extracted text by removing excessive whitespace and normalizing spacing
 */
function cleanExtractedText(text: string): string {
  return text
    // Trim leading and trailing whitespace
    .trim()
    // Replace multiple spaces with single space
    .replace(/[ \t]+/g, ' ')
    // Replace multiple newlines with maximum two newlines
    .replace(/\n{3,}/g, '\n\n')
    // Remove spaces before newlines
    .replace(/ +\n/g, '\n')
    // Remove spaces after newlines
    .replace(/\n +/g, '\n')
    // Normalize line endings
    .replace(/\r\n/g, '\n')
    .trim();
}
