import { z } from 'zod';

const personalInfoSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  location: z.string().optional(),
  website: z.string().optional().refine((val) => !val || val === '' || z.string().url().safeParse(val).success, {
    message: 'Invalid URL',
  }),
  linkedin: z.string().optional().refine((val) => !val || val === '' || z.string().url().safeParse(val).success, {
    message: 'Invalid URL',
  }),
  github: z.string().optional().refine((val) => !val || val === '' || z.string().url().safeParse(val).success, {
    message: 'Invalid URL',
  }),
});

const experienceSchema = z.object({
  _id: z.string().optional(),
  company: z.string().min(1, 'Company is required'),
  position: z.string().min(1, 'Position is required'),
  location: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  current: z.boolean(),
  description: z.string().min(1, 'Description is required'),
  achievements: z.array(z.string()).optional(),
});

const educationSchema = z.object({
  _id: z.string().optional(),
  institution: z.string().min(1, 'Institution is required'),
  degree: z.string().min(1, 'Degree is required'),
  field: z.string().min(1, 'Field of study is required'),
  location: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  current: z.boolean(),
  gpa: z.string().optional(),
  achievements: z.array(z.string()).optional(),
});

const projectSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(1, 'Project name is required'),
  description: z.string().min(1, 'Description is required'),
  technologies: z.array(z.string()).min(1, 'At least one technology is required'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  url: z.string().optional().refine((val) => !val || val === '' || z.string().url().safeParse(val).success, {
    message: 'Invalid URL',
  }),
  github: z.string().optional().refine((val) => !val || val === '' || z.string().url().safeParse(val).success, {
    message: 'Invalid URL',
  }),
  highlights: z.array(z.string()).optional(),
});

const courseworkSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(1, 'Coursework name is required'),
});

const technicalSkillCategorySchema = z.object({
  _id: z.string().optional(),
  category: z.string().min(1, 'Category name is required'),
  items: z.array(z.string()).min(1, 'At least one item is required'),
});

export const resumeSchema = z.object({
  title: z.string().min(1, 'Resume title is required'),
  personalInfo: personalInfoSchema,
  summary: z.string().optional(),
  experience: z.array(experienceSchema),
  education: z.array(educationSchema),
  projects: z.array(projectSchema),
  coursework: z.array(courseworkSchema).optional(),
  technicalSkills: z.array(technicalSkillCategorySchema).optional(),
  skills: z.array(z.string()),
  languages: z.array(z.string()).optional(),
  achievements: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  visibility: z.enum(['private', 'public']).optional(),
  templateSettings: z
    .object({
      template: z.enum(['modern', 'classic', 'minimal', 'creative', 'professional', 'executive', 'compact']),
      colorTheme: z.enum(['blue', 'green', 'red', 'purple', 'orange', 'teal', 'gray', 'black', 'maroon']),
      primaryColor: z.string(),
      fontSize: z.enum(['small', 'medium', 'large']),
      spacing: z.enum(['compact', 'normal', 'spacious']),
      font: z.enum(['sans-serif', 'serif', 'monospace']),
    })
    .optional(),
});

export type ResumeFormData = z.infer<typeof resumeSchema>;
