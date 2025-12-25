import { body, ValidationChain } from 'express-validator';

/**
 * Validation for enhance summary endpoint
 */
export const validateEnhanceSummary: ValidationChain[] = [
  body('summary')
    .notEmpty()
    .withMessage('Summary is required')
    .isString()
    .withMessage('Summary must be a string')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Summary must be between 10 and 1000 characters'),
  body('jobTitle')
    .optional()
    .isString()
    .withMessage('Job title must be a string')
    .isLength({ max: 100 })
    .withMessage('Job title must not exceed 100 characters'),
];

/**
 * Validation for generate experience bullets endpoint
 */
export const validateGenerateExperienceBullets: ValidationChain[] = [
  body('jobTitle')
    .notEmpty()
    .withMessage('Job title is required')
    .isString()
    .withMessage('Job title must be a string')
    .isLength({ min: 2, max: 100 })
    .withMessage('Job title must be between 2 and 100 characters'),
  body('company')
    .notEmpty()
    .withMessage('Company is required')
    .isString()
    .withMessage('Company must be a string')
    .isLength({ min: 2, max: 100 })
    .withMessage('Company must be between 2 and 100 characters'),
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isString()
    .withMessage('Description must be a string')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('numberOfBullets')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Number of bullets must be between 1 and 10'),
];

/**
 * Validation for improve project description endpoint
 */
export const validateImproveProjectDescription: ValidationChain[] = [
  body('projectName')
    .notEmpty()
    .withMessage('Project name is required')
    .isString()
    .withMessage('Project name must be a string')
    .isLength({ min: 2, max: 100 })
    .withMessage('Project name must be between 2 and 100 characters'),
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isString()
    .withMessage('Description must be a string')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('technologies')
    .notEmpty()
    .withMessage('Technologies are required')
    .isArray({ min: 1 })
    .withMessage('Technologies must be an array with at least one item'),
  body('technologies.*')
    .isString()
    .withMessage('Each technology must be a string'),
];

/**
 * Validation for enhance resume content endpoint
 */
export const validateEnhanceResumeContent: ValidationChain[] = [
  body('summary')
    .optional()
    .isString()
    .withMessage('Summary must be a string')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Summary must be between 10 and 1000 characters'),
  body('experience')
    .optional()
    .isArray()
    .withMessage('Experience must be an array'),
  body('experience.*.position')
    .if(body('experience').exists())
    .notEmpty()
    .withMessage('Position is required for each experience')
    .isString()
    .withMessage('Position must be a string'),
  body('experience.*.company')
    .if(body('experience').exists())
    .notEmpty()
    .withMessage('Company is required for each experience')
    .isString()
    .withMessage('Company must be a string'),
  body('experience.*.description')
    .if(body('experience').exists())
    .notEmpty()
    .withMessage('Description is required for each experience')
    .isString()
    .withMessage('Description must be a string'),
  body('projects')
    .optional()
    .isArray()
    .withMessage('Projects must be an array'),
  body('projects.*.name')
    .if(body('projects').exists())
    .notEmpty()
    .withMessage('Project name is required')
    .isString()
    .withMessage('Project name must be a string'),
  body('projects.*.description')
    .if(body('projects').exists())
    .notEmpty()
    .withMessage('Project description is required')
    .isString()
    .withMessage('Project description must be a string'),
  body('projects.*.technologies')
    .if(body('projects').exists())
    .notEmpty()
    .withMessage('Project technologies are required')
    .isArray()
    .withMessage('Technologies must be an array'),
];

/**
 * Validation for suggest skills endpoint
 */
export const validateSuggestSkills: ValidationChain[] = [
  body('jobTitle')
    .notEmpty()
    .withMessage('Job title is required')
    .isString()
    .withMessage('Job title must be a string')
    .isLength({ min: 2, max: 100 })
    .withMessage('Job title must be between 2 and 100 characters'),
  body('experienceLevel')
    .optional()
    .isIn(['junior', 'mid', 'senior'])
    .withMessage('Experience level must be junior, mid, or senior'),
  body('currentSkills')
    .optional()
    .isArray()
    .withMessage('Current skills must be an array'),
  body('currentSkills.*')
    .if(body('currentSkills').exists())
    .isString()
    .withMessage('Each skill must be a string'),
];
