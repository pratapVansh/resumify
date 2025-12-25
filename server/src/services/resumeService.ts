/**
 * Resume Service
 * Handles business logic for resume operations
 */

import Resume, { IResume } from '../models/Resume.js';
import { AppError } from '../utils/AppError.js';
import mongoose from 'mongoose';

/**
 * Create a new resume
 */
export const createResume = async (
  userId: string,
  resumeData: Partial<IResume>
): Promise<IResume> => {
  // Ensure user ID is attached
  const resume = await Resume.create({
    ...resumeData,
    user: userId,
  });

  return resume;
};

/**
 * Get all resumes for a specific user
 */
export const getUserResumes = async (userId: string): Promise<IResume[]> => {
  const resumes = await Resume.find({ user: userId })
    .sort({ updatedAt: -1 }) // Most recently updated first
    .select('-__v');

  return resumes;
};

/**
 * Get a single resume by ID
 * Only returns if resume belongs to the user
 */
export const getResumeById = async (
  resumeId: string,
  userId: string
): Promise<IResume> => {
  // Validate resume ID
  if (!mongoose.Types.ObjectId.isValid(resumeId)) {
    throw new AppError('Invalid resume ID', 400);
  }

  const resume = await Resume.findOne({
    _id: resumeId,
    user: userId,
  }).select('-__v');

  if (!resume) {
    throw new AppError('Resume not found or you do not have access', 404);
  }

  return resume;
};

/**
 * Update a resume
 * Only allows update if resume belongs to the user
 */
export const updateResume = async (
  resumeId: string,
  userId: string,
  updateData: Partial<IResume>
): Promise<IResume> => {
  // Validate resume ID
  if (!mongoose.Types.ObjectId.isValid(resumeId)) {
    throw new AppError('Invalid resume ID', 400);
  }

  // Prevent user from changing ownership
  const { user, ...safeUpdateData } = updateData as any;

  const resume = await Resume.findOneAndUpdate(
    {
      _id: resumeId,
      user: userId,
    },
    safeUpdateData,
    {
      new: true, // Return updated document
      runValidators: true, // Run schema validators
    }
  ).select('-__v');

  if (!resume) {
    throw new AppError('Resume not found or you do not have access', 404);
  }

  return resume;
};

/**
 * Delete a resume
 * Only allows deletion if resume belongs to the user
 */
export const deleteResume = async (
  resumeId: string,
  userId: string
): Promise<void> => {
  // Validate resume ID
  if (!mongoose.Types.ObjectId.isValid(resumeId)) {
    throw new AppError('Invalid resume ID', 400);
  }

  const resume = await Resume.findOneAndDelete({
    _id: resumeId,
    user: userId,
  });

  if (!resume) {
    throw new AppError('Resume not found or you do not have access', 404);
  }
};

/**
 * Get a public resume by share ID
 * Anyone can access if visibility is public
 */
export const getPublicResume = async (shareId: string): Promise<IResume> => {
  const resume = await Resume.findOne({
    shareId,
    visibility: 'public',
  })
    .populate('user', 'firstName lastName') // Include basic user info
    .select('-__v');

  if (!resume) {
    throw new AppError('Resume not found or is not public', 404);
  }

  return resume;
};

/**
 * Toggle resume visibility (public/private)
 */
export const toggleVisibility = async (
  resumeId: string,
  userId: string
): Promise<IResume> => {
  // Validate resume ID
  if (!mongoose.Types.ObjectId.isValid(resumeId)) {
    throw new AppError('Invalid resume ID', 400);
  }

  const resume = await Resume.findOne({
    _id: resumeId,
    user: userId,
  });

  if (!resume) {
    throw new AppError('Resume not found or you do not have access', 404);
  }

  // Toggle visibility
  resume.visibility = resume.visibility === 'public' ? 'private' : 'public';
  await resume.save();

  return resume;
};

/**
 * Regenerate share ID for a resume
 */
export const regenerateShareId = async (
  resumeId: string,
  userId: string
): Promise<IResume> => {
  // Validate resume ID
  if (!mongoose.Types.ObjectId.isValid(resumeId)) {
    throw new AppError('Invalid resume ID', 400);
  }

  const resume = await Resume.findOne({
    _id: resumeId,
    user: userId,
  });

  if (!resume) {
    throw new AppError('Resume not found or you do not have access', 404);
  }

  // Regenerate share ID
  resume.generateShareId();
  await resume.save();

  return resume;
};

/**
 * Duplicate a resume
 */
export const duplicateResume = async (
  resumeId: string,
  userId: string
): Promise<IResume> => {
  // Validate resume ID
  if (!mongoose.Types.ObjectId.isValid(resumeId)) {
    throw new AppError('Invalid resume ID', 400);
  }

  const originalResume = await Resume.findOne({
    _id: resumeId,
    user: userId,
  });

  if (!originalResume) {
    throw new AppError('Resume not found or you do not have access', 404);
  }

  // Create a copy
  const resumeData = originalResume.toObject();
  delete resumeData._id;
  delete resumeData.createdAt;
  delete resumeData.updatedAt;
  delete resumeData.shareId; // Will be auto-generated

  const duplicatedResume = await Resume.create({
    ...resumeData,
    title: `${resumeData.title} (Copy)`,
    visibility: 'private', // Always start as private
  });

  return duplicatedResume;
};

/**
 * Get resume count for a user
 */
export const getResumeCount = async (userId: string): Promise<number> => {
  const count = await Resume.countDocuments({ user: userId });
  return count;
};
