import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import * as pdfController from '../controllers/pdfController.js';

const router = express.Router();

/**
 * @route   GET /api/pdf/resume/share/:shareId
 * @desc    Download public resume by share ID
 * @access  Public
 */
router.get('/resume/share/:shareId', pdfController.downloadPublicResume);

// All routes below require authentication
router.use(protect);

/**
 * @route   GET /api/pdf/resume/:resumeId/download
 * @desc    Download resume as PDF
 * @access  Private
 */
router.get('/resume/:resumeId/download', pdfController.downloadResumePDF);

/**
 * @route   GET /api/pdf/resume/:resumeId/preview
 * @desc    Preview resume PDF (inline)
 * @access  Private
 */
router.get('/resume/:resumeId/preview', pdfController.previewResumePDF);

/**
 * @route   POST /api/pdf/resume/:resumeId/upload
 * @desc    Generate and upload resume PDF to Cloudinary
 * @access  Private
 */
router.post('/resume/:resumeId/upload', pdfController.generateAndUploadPDF);

export default router;
