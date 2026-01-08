import api from './api';

/**
 * Enhance professional summary using AI
 */
export const enhanceSummary = async (currentSummary: string, jobTitle?: string): Promise<string> => {
  const response = await api.post('/ai/enhance-summary', {
    summary: currentSummary,
    jobTitle,
  });
  return response.data.data.enhanced;
};

/**
 * Generate bullet points for work experience
 */
export const generateExperienceBullets = async (
  jobTitle: string,
  company: string,
  description: string,
  numberOfBullets: number = 3
): Promise<string[]> => {
  const response = await api.post('/ai/generate-experience-bullets', {
    jobTitle,
    company,
    description,
    numberOfBullets,
  });
  return response.data.data.bullets;
};

/**
 * Improve project description using AI
 */
export const improveProjectDescription = async (
  projectName: string,
  currentDescription: string,
  technologies: string[]
): Promise<string> => {
  const response = await api.post('/ai/improve-project-description', {
    projectName,
    description: currentDescription,
    technologies,
  });
  return response.data.data.improved;
};

/**
 * Enhance entire resume content
 */
export const enhanceResumeContent = async (resumeData: {
  summary?: string;
  experience?: Array<{
    position: string;
    company: string;
    description: string;
  }>;
  projects?: Array<{
    name: string;
    description: string;
    technologies: string[];
  }>;
}): Promise<{
  summary?: string;
  experience?: Array<{ position: string; company: string; bullets: string[] }>;
  projects?: Array<{ name: string; description: string }>;
}> => {
  const response = await api.post('/ai/enhance-resume', resumeData);
  return response.data.data.enhanced;
};

/**
 * Generate skill suggestions
 */
export const suggestSkills = async (
  jobTitle: string,
  experienceLevel: 'junior' | 'mid' | 'senior',
  currentSkills: string[]
): Promise<string[]> => {
  const response = await api.post('/ai/suggest-skills', {
    jobTitle,
    experienceLevel,
    currentSkills,
  });
  return response.data.data.suggestions;
};
