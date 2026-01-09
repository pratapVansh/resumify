import express from 'express';
import * as aiController from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validation.js';
import {
  validateEnhanceSummary,
  validateGenerateExperienceBullets,
  validateImproveProjectDescription,
  validateEnhanceResumeContent,
  validateSuggestSkills,
} from '../middleware/aiValidation.js';

const router = express.Router();

// All AI routes require authentication
router.use(protect);

/**
 * @route   POST /api/ai/enhance-summary
 * @desc    Enhance professional summary using AI
 * @access  Private
 */
router.post('/enhance-summary', validateEnhanceSummary, validate, aiController.enhanceSummary);

/**
 * @route   POST /api/ai/generate-experience-bullets
 * @desc    Generate bullet points for work experience
 * @access  Private
 */
router.post(
  '/generate-experience-bullets',
  validateGenerateExperienceBullets,
  validate,
  aiController.generateExperienceBullets
);

/**
 * @route   POST /api/ai/improve-project-description
 * @desc    Improve project description using AI
 * @access  Private
 */
router.post(
  '/improve-project-description',
  validateImproveProjectDescription,
  validate,
  aiController.improveProjectDescription
);

/**
 * @route   POST /api/ai/enhance-resume
 * @desc    Enhance entire resume content using AI
 * @access  Private
 */
router.post(
  '/enhance-resume',
  validateEnhanceResumeContent,
  validate,
  aiController.enhanceResumeContent
);

/**
 * @route   POST /api/ai/suggest-skills
 * @desc    Generate skill suggestions based on job title
 * @access  Private
 */
router.post('/suggest-skills', validateSuggestSkills, validate, aiController.suggestSkills);

export default router;
