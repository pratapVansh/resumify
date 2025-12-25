import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';
import { AppError } from '../utils/AppError.js';

// Configure multer to use memory storage
const storage = multer.memoryStorage();

// File filter for images
const imageFileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
  // Accept images only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new AppError('Only image files are allowed', 400) as any);
  }
};

// File filter for PDFs
const pdfFileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
  // Accept PDFs only
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new AppError('Only PDF files are allowed', 400) as any);
  }
};

// Multer upload configurations
export const uploadImage = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export const uploadPDF = multer({
  storage,
  fileFilter: pdfFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Generic upload without file type restrictions
export const uploadFile = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});
