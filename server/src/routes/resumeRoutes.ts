/**
 * Resume Routes
 * Defines all resume-related endpoints
 */

import express from 'express';
import * as resumeController from '../controllers/resumeController.js';
import { protect } from '../middleware/authMiddleware.js';
import {
  validateCreateResume,
  validateUpdateResume,
} from '../middleware/resumeValidation.js';
import { uploadResumeDocument } from '../middleware/upload.js';

const router = express.Router();

/**
 * Public routes
 */

// Get public resume by share ID
router.get('/public/:shareId', resumeController.getPublicResume);

/**
 * Protected routes (require authentication)
 */

// Get resume statistics
router.get('/stats/count', protect, resumeController.getResumeStats);

// Get all resumes for logged-in user
router.get('/', protect, resumeController.getMyResumes);

// Create new resume
router.post('/', protect, validateCreateResume, resumeController.createResume);

// Parse uploaded resume file (PDF or DOCX)
router.post('/parse', protect, uploadResumeDocument.single('file'), resumeController.parseResume);

// Get single resume
router.get('/:id', protect, resumeController.getResume);

// Update resume
router.put('/:id', protect, validateUpdateResume, resumeController.updateResume);

// Delete resume
router.delete('/:id', protect, resumeController.deleteResume);

// Toggle visibility
router.patch('/:id/visibility', protect, resumeController.toggleVisibility);

// Regenerate share ID
router.patch('/:id/regenerate-share-id', protect, resumeController.regenerateShareId);

// Duplicate resume
router.post('/:id/duplicate', protect, resumeController.duplicateResume);

export default router;
