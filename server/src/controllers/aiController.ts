import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as aiService from '../services/aiService.js';

/**
 * @route   POST /api/ai/enhance-summary
 * @desc    Enhance professional summary using AI
 * @access  Private
 */
export const enhanceSummary = asyncHandler(async (req: Request, res: Response) => {
  const { summary, jobTitle } = req.body;

  const enhancedSummary = await aiService.enhanceSummary(summary, jobTitle);

  res.status(200).json({
    status: 'success',
    data: {
      original: summary,
      enhanced: enhancedSummary,
    },
  });
});

/**
 * @route   POST /api/ai/generate-experience-bullets
 * @desc    Generate bullet points for work experience
 * @access  Private
 */
export const generateExperienceBullets = asyncHandler(async (req: Request, res: Response) => {
  const { jobTitle, company, description, numberOfBullets = 3 } = req.body;

  const bullets = await aiService.generateExperienceBullets(
    jobTitle,
    company,
    description,
    numberOfBullets
  );

  res.status(200).json({
    status: 'success',
    data: {
      bullets,
    },
  });
});

/**
 * @route   POST /api/ai/improve-project-description
 * @desc    Improve project description using AI
 * @access  Private
 */
export const improveProjectDescription = asyncHandler(async (req: Request, res: Response) => {
  const { projectName, description, technologies } = req.body;

  const improvedDescription = await aiService.improveProjectDescription(
    projectName,
    description,
    technologies
  );

  res.status(200).json({
    status: 'success',
    data: {
      original: description,
      improved: improvedDescription,
    },
  });
});

/**
 * @route   POST /api/ai/enhance-resume
 * @desc    Enhance entire resume content using AI
 * @access  Private
 */
export const enhanceResumeContent = asyncHandler(async (req: Request, res: Response) => {
  const { summary, experience, projects } = req.body;

  const enhancedContent = await aiService.enhanceResumeContent({
    summary,
    experience,
    projects,
  });

  res.status(200).json({
    status: 'success',
    data: enhancedContent,
  });
});

/**
 * @route   POST /api/ai/suggest-skills
 * @desc    Generate skill suggestions based on job title
 * @access  Private
 */
export const suggestSkills = asyncHandler(async (req: Request, res: Response) => {
  const { jobTitle, experienceLevel = 'mid', currentSkills = [] } = req.body;

  const suggestions = await aiService.generateSkillsSuggestions(
    jobTitle,
    experienceLevel,
    currentSkills
  );

  res.status(200).json({
    status: 'success',
    data: {
      suggestions,
    },
  });
});
