/**
 * Resume Validation Middleware
 * Input validation for resume operations
 */

import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError.js';

/**
 * Middleware to check validation results
 */
const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    throw new AppError(errorMessages.join('. '), 400);
  }

  next();
};

/**
 * Validation rules for creating a resume
 */
export const validateCreateResume = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Resume title is required')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),

  body('personalInfo')
    .notEmpty()
    .withMessage('Personal information is required')
    .isObject()
    .withMessage('Personal information must be an object'),

  body('personalInfo.firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required'),

  body('personalInfo.lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required'),

  body('personalInfo.email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email'),

  body('personalInfo.phone')
    .optional()
    .trim(),

  body('personalInfo.location')
    .optional()
    .trim(),

  body('personalInfo.website')
    .optional({ checkFalsy: true })
    .trim()
    .custom((value) => {
      if (!value || value === '') return true;
      return /^https?:\/\/.+/.test(value);
    })
    .withMessage('Website must be a valid URL'),

  body('personalInfo.linkedin')
    .optional()
    .trim(),

  body('personalInfo.github')
    .optional()
    .trim(),

  body('summary')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Summary cannot exceed 1000 characters'),

  body('experience')
    .optional()
    .isArray()
    .withMessage('Experience must be an array'),

  body('experience.*.company')
    .if(body('experience').exists())
    .trim()
    .notEmpty()
    .withMessage('Company name is required for experience items'),

  body('experience.*.position')
    .if(body('experience').exists())
    .trim()
    .notEmpty()
    .withMessage('Position is required for experience items'),

  body('experience.*.startDate')
    .if(body('experience').exists())
    .notEmpty()
    .withMessage('Start date is required for experience items')
    .isISO8601()
    .withMessage('Start date must be a valid date'),

  body('experience.*.endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),

  body('experience.*.current')
    .optional()
    .isBoolean()
    .withMessage('Current field must be a boolean'),

  body('experience.*.description')
    .if(body('experience').exists())
    .trim()
    .notEmpty()
    .withMessage('Description is required for experience items'),

  body('education')
    .optional()
    .isArray()
    .withMessage('Education must be an array'),

  body('education.*.institution')
    .if(body('education').exists())
    .trim()
    .notEmpty()
    .withMessage('Institution name is required for education items'),

  body('education.*.degree')
    .if(body('education').exists())
    .trim()
    .notEmpty()
    .withMessage('Degree is required for education items'),

  body('education.*.field')
    .if(body('education').exists())
    .trim()
    .notEmpty()
    .withMessage('Field of study is required for education items'),

  body('education.*.startDate')
    .if(body('education').exists())
    .notEmpty()
    .withMessage('Start date is required for education items')
    .isISO8601()
    .withMessage('Start date must be a valid date'),

  body('education.*.endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),

  body('projects')
    .optional()
    .isArray()
    .withMessage('Projects must be an array'),

  body('projects.*.name')
    .if(body('projects').exists())
    .trim()
    .notEmpty()
    .withMessage('Project name is required'),

  body('projects.*.description')
    .if(body('projects').exists())
    .trim()
    .notEmpty()
    .withMessage('Project description is required'),

  body('projects.*.technologies')
    .if(body('projects').exists())
    .isArray()
    .withMessage('Technologies must be an array')
    .notEmpty()
    .withMessage('At least one technology is required'),

  body('projects.*.url')
    .optional({ checkFalsy: true })
    .trim()
    .custom((value) => {
      if (!value || value === '') return true;
      return /^https?:\/\/.+/.test(value);
    })
    .withMessage('Project URL must be valid'),

  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),

  body('languages')
    .optional()
    .isArray()
    .withMessage('Languages must be an array'),

  body('certifications')
    .optional()
    .isArray()
    .withMessage('Certifications must be an array'),

  body('visibility')
    .optional()
    .isIn(['private', 'public'])
    .withMessage('Visibility must be either private or public'),

  body('templateSettings')
    .optional()
    .isObject()
    .withMessage('Template settings must be an object'),

  body('templateSettings.template')
    .optional()
    .isIn(['modern', 'classic', 'minimal', 'creative'])
    .withMessage('Invalid template type'),

  body('templateSettings.primaryColor')
    .optional()
    .trim()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Primary color must be a valid hex color'),

  body('templateSettings.fontSize')
    .optional()
    .isIn(['small', 'medium', 'large'])
    .withMessage('Font size must be small, medium, or large'),

  body('templateSettings.spacing')
    .optional()
    .isIn(['compact', 'normal', 'spacious'])
    .withMessage('Spacing must be compact, normal, or spacious'),

  body('templateSettings.font')
    .optional()
    .isIn(['sans-serif', 'serif', 'monospace'])
    .withMessage('Font must be sans-serif, serif, or monospace'),

  validate,
];

/**
 * Validation rules for updating a resume
 * More lenient than create - allows partial updates
 */
export const validateUpdateResume = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Resume title cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),

  body('personalInfo')
    .optional()
    .isObject()
    .withMessage('Personal information must be an object'),

  body('personalInfo.firstName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('First name cannot be empty'),

  body('personalInfo.lastName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Last name cannot be empty'),

  body('personalInfo.email')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Email cannot be empty')
    .isEmail()
    .withMessage('Please provide a valid email'),

  body('personalInfo.website')
    .optional()
    .trim()
    .custom((value) => value === '' || /^https?:\/\/.+/.test(value))
    .withMessage('Website must be a valid URL or empty'),

  body('summary')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Summary cannot exceed 1000 characters'),

  body('experience')
    .optional()
    .isArray()
    .withMessage('Experience must be an array'),

  body('education')
    .optional()
    .isArray()
    .withMessage('Education must be an array'),

  body('projects')
    .optional()
    .isArray()
    .withMessage('Projects must be an array'),

  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),

  body('languages')
    .optional()
    .isArray()
    .withMessage('Languages must be an array'),

  body('certifications')
    .optional()
    .isArray()
    .withMessage('Certifications must be an array'),

  body('visibility')
    .optional()
    .isIn(['private', 'public'])
    .withMessage('Visibility must be either private or public'),

  body('templateSettings')
    .optional()
    .isObject()
    .withMessage('Template settings must be an object'),

  body('templateSettings.template')
    .optional()
    .isIn(['modern', 'classic', 'minimal', 'creative'])
    .withMessage('Invalid template type'),

  body('templateSettings.primaryColor')
    .optional()
    .trim()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Primary color must be a valid hex color'),

  body('templateSettings.fontSize')
    .optional()
    .isIn(['small', 'medium', 'large'])
    .withMessage('Font size must be small, medium, or large'),

  body('templateSettings.spacing')
    .optional()
    .isIn(['compact', 'normal', 'spacious'])
    .withMessage('Spacing must be compact, normal, or spacious'),

  body('templateSettings.font')
    .optional()
    .isIn(['sans-serif', 'serif', 'monospace'])
    .withMessage('Font must be sans-serif, serif, or monospace'),

  validate,
];
