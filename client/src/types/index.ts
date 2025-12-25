/**
 * API Types
 */

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role: 'user' | 'admin';
  isEmailVerified: boolean;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  status: string;
  message: string;
  data: {
    user: User;
    accessToken: string;
  };
}

/**
 * Resume Types
 */

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location?: string;
  website?: string;
  linkedin?: string;
  github?: string;
}

export interface Experience {
  _id?: string;
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
  achievements?: string[];
}

export interface Education {
  _id?: string;
  institution: string;
  degree: string;
  field: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  gpa?: string;
  achievements?: string[];
}

export interface Project {
  _id?: string;
  name: string;
  description: string;
  technologies: string[];
  startDate?: string;
  endDate?: string;
  url?: string;
  github?: string;
  highlights?: string[];
}

export interface TemplateSettings {
  template: 'modern' | 'classic' | 'minimal' | 'creative';
  primaryColor: string;
  fontSize: 'small' | 'medium' | 'large';
  spacing: 'compact' | 'normal' | 'spacious';
  font: 'sans-serif' | 'serif' | 'monospace';
}

export interface Resume {
  _id: string;
  user: string;
  title: string;
  personalInfo: PersonalInfo;
  summary?: string;
  experience: Experience[];
  education: Education[];
  projects: Project[];
  skills: string[];
  languages?: string[];
  certifications?: string[];
  visibility: 'private' | 'public';
  shareId: string;
  templateSettings: TemplateSettings;
  pdfUrl?: string;         // RAW download URL
  pdfPublicId?: string;
  thumbnailUrl?: string;   // Legacy field (use previewUrl)
  previewUrl?: string;     // JPG preview for cards
  viewPdfUrl?: string;     // PDF view URL for inline viewing
  createdAt: string;
  updatedAt: string;
}

export interface ResumeFormData {
  title: string;
  personalInfo: PersonalInfo;
  summary?: string;
  experience: Experience[];
  education: Education[];
  projects: Project[];
  skills: string[];
  languages?: string[];
  certifications?: string[];
  visibility?: 'private' | 'public';
  templateSettings?: TemplateSettings;
}

export interface ApiResponse<T> {
  status: 'success' | 'fail' | 'error';
  message?: string;
  data?: T;
  results?: number;
}

export interface ApiError {
  status: 'fail' | 'error';
  message: string;
}
