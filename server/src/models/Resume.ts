/**
 * Resume Model
 * Handles resume data structure and related operations
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import { nanoid } from 'nanoid';

/**
 * Interface for Experience items
 */
export interface IExperience {
  company: string;
  position: string;
  location?: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  description: string;
  achievements?: string[];
}

/**
 * Interface for Education items
 */
export interface IEducation {
  institution: string;
  degree: string;
  field: string;
  location?: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  gpa?: string;
  achievements?: string[];
}

/**
 * Interface for Project items
 */
export interface IProject {
  name: string;
  description: string;
  technologies: string[];
  startDate?: Date;
  endDate?: Date;
  url?: string;
  github?: string;
  highlights?: string[];
}

/**
 * Interface for Personal Information
 */
export interface IPersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  profilePhoto?: string;
  profilePhotoPublicId?: string;
}

/**
 * Interface for Template Settings
 */
export interface ITemplateSettings {
  template: 'modern' | 'classic' | 'minimal' | 'creative';
  primaryColor: string;
  fontSize: 'small' | 'medium' | 'large';
  spacing: 'compact' | 'normal' | 'spacious';
  font: 'sans-serif' | 'serif' | 'monospace';
}

/**
 * Interface for Resume document
 */
export interface IResume extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  personalInfo: IPersonalInfo;
  summary?: string;
  experience: IExperience[];
  education: IEducation[];
  projects: IProject[];
  skills: string[];
  languages?: string[];
  certifications?: string[];
  visibility: 'private' | 'public';
  shareId: string;
  templateSettings: ITemplateSettings;
  pdfUrl?: string;           // RAW download URL
  pdfPublicId?: string;
  thumbnailUrl?: string;     // Legacy field (use previewUrl)
  previewUrl?: string;       // JPG preview for cards
  viewPdfUrl?: string;       // PDF view URL for inline viewing
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  generateShareId(): string;
  getThumbnailUrl(): string;
}

/**
 * Experience Schema
 */
const experienceSchema = new Schema<IExperience>(
  {
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    position: {
      type: String,
      required: [true, 'Position is required'],
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
    },
    current: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
    },
    achievements: [
      {
        type: String,
      },
    ],
  },
  { _id: true }
);

/**
 * Education Schema
 */
const educationSchema = new Schema<IEducation>(
  {
    institution: {
      type: String,
      required: [true, 'Institution name is required'],
      trim: true,
    },
    degree: {
      type: String,
      required: [true, 'Degree is required'],
      trim: true,
    },
    field: {
      type: String,
      required: [true, 'Field of study is required'],
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
    },
    current: {
      type: Boolean,
      default: false,
    },
    gpa: {
      type: String,
      trim: true,
    },
    achievements: [
      {
        type: String,
      },
    ],
  },
  { _id: true }
);

/**
 * Project Schema
 */
const projectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
    },
    technologies: [
      {
        type: String,
        required: true,
      },
    ],
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    url: {
      type: String,
      trim: true,
    },
    github: {
      type: String,
      trim: true,
    },
    highlights: [
      {
        type: String,
      },
    ],
  },
  { _id: true }
);

/**
 * Personal Info Schema
 */
const personalInfoSchema = new Schema<IPersonalInfo>(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    linkedin: {
      type: String,
      trim: true,
    },
    github: {
      type: String,
      trim: true,
    },
    profilePhoto: {
      type: String,
      trim: true,
    },
    profilePhotoPublicId: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

/**
 * Template Settings Schema
 */
const templateSettingsSchema = new Schema<ITemplateSettings>(
  {
    template: {
      type: String,
      enum: ['modern', 'classic', 'minimal', 'creative'],
      default: 'modern',
    },
    primaryColor: {
      type: String,
      default: '#3B82F6', // Blue
    },
    fontSize: {
      type: String,
      enum: ['small', 'medium', 'large'],
      default: 'medium',
    },
    spacing: {
      type: String,
      enum: ['compact', 'normal', 'spacious'],
      default: 'normal',
    },
    font: {
      type: String,
      enum: ['sans-serif', 'serif', 'monospace'],
      default: 'sans-serif',
    },
  },
  { _id: false }
);

/**
 * Resume Schema Definition
 */
const resumeSchema = new Schema<IResume>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Resume title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    personalInfo: {
      type: personalInfoSchema,
      required: [true, 'Personal information is required'],
    },
    summary: {
      type: String,
      maxlength: [1000, 'Summary cannot exceed 1000 characters'],
    },
    experience: {
      type: [experienceSchema],
      default: [],
    },
    education: {
      type: [educationSchema],
      default: [],
    },
    projects: {
      type: [projectSchema],
      default: [],
    },
    skills: {
      type: [String],
      default: [],
    },
    languages: {
      type: [String],
      default: [],
    },
    certifications: {
      type: [String],
      default: [],
    },
    visibility: {
      type: String,
      enum: ['private', 'public'],
      default: 'private',
    },
    shareId: {
      type: String,
      unique: true,
      index: true,
    },
    templateSettings: {
      type: templateSettingsSchema,
      default: () => ({}),
    },
    pdfUrl: {
      type: String,
      trim: true,
    },
    pdfPublicId: {
      type: String,
      trim: true,
    },
    thumbnailUrl: {
      type: String,
      trim: true,
    },
    previewUrl: {
      type: String,
      trim: true,
    },
    viewPdfUrl: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Pre-save middleware to generate shareId
 */
resumeSchema.pre('save', function (next) {
  if (!this.shareId) {
    this.shareId = nanoid(12); // Generate 12-character unique ID
  }
  next();
});

/**
 * Method to regenerate share ID
 */
resumeSchema.methods.generateShareId = function (): string {
  this.shareId = nanoid(12);
  return this.shareId;
};

/**
 * Method to get thumbnail URL from Cloudinary PDF
 * Generates a thumbnail from the first page of the PDF
 */
resumeSchema.methods.getThumbnailUrl = function (): string {
  if (!this.pdfPublicId) {
    return '';
  }
  
  // Cloudinary transformation to generate thumbnail from PDF
  // - page 1 of PDF
  // - convert to JPG
  // - width 300px
  // - quality auto
  const baseUrl = 'https://res.cloudinary.com';
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'dljikgsuy';
  const transformation = 'w_300,h_400,c_fill,f_jpg,pg_1,q_auto';
  
  return `${baseUrl}/${cloudName}/image/upload/${transformation}/${this.pdfPublicId}.jpg`;
};

/**
 * Indexes for better query performance
 */
resumeSchema.index({ user: 1, createdAt: -1 });
resumeSchema.index({ shareId: 1 });
resumeSchema.index({ visibility: 1 });

/**
 * Create and export Resume model
 */
const Resume: Model<IResume> = mongoose.model<IResume>('Resume', resumeSchema);

export default Resume;
