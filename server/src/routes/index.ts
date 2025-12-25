/**
 * Main Routes Index
 * Aggregates all route modules
 */

import express from 'express';
import authRoutes from './authRoutes.js';
import resumeRoutes from './resumeRoutes.js';
import aiRoutes from './aiRoutes.js';
import uploadRoutes from './uploadRoutes.js';
import pdfRoutes from './pdfRoutes.js';

const router = express.Router();

/**
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Mount route modules
 */
router.use('/auth', authRoutes);
router.use('/resumes', resumeRoutes);
router.use('/ai', aiRoutes);
router.use('/upload', uploadRoutes);
router.use('/pdf', pdfRoutes);

export default router;
