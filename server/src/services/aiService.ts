import { GoogleGenerativeAI } from '@google/generative-ai';
import { AppError } from '../utils/AppError';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Get the Gemini model
const getModel = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new AppError('Gemini API key is not configured', 500);
  }
  return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
};

/**
 * Enhance professional summary
 */
export const enhanceSummary = async (currentSummary: string, jobTitle?: string): Promise<string> => {
  try {
    const model = getModel();
    
    const prompt = `You are an expert resume writer specializing in ATS-friendly content.

Current Summary: "${currentSummary}"
${jobTitle ? `Target Job Title: ${jobTitle}` : ''}

Task: Enhance this professional summary to be:
- ATS-friendly with relevant keywords
- Concise (2-3 sentences, max 80 words)
- Professional and impactful
- Action-oriented
- Quantifiable when possible

Return ONLY the enhanced summary text, no explanations or formatting.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const enhancedText = response.text().trim();

    return enhancedText;
  } catch (error: any) {
    console.error('AI Enhancement Error:', error);
    throw new AppError('Failed to enhance summary with AI', 500);
  }
};

/**
 * Generate professional bullet points for work experience
 */
export const generateExperienceBullets = async (
  jobTitle: string,
  company: string,
  description: string,
  numberOfBullets: number = 3
): Promise<string[]> => {
  try {
    const model = getModel();
    
    const prompt = `You are an expert resume writer specializing in ATS-friendly content.

Job Title: ${jobTitle}
Company: ${company}
Current Description: "${description}"

Task: Generate ${numberOfBullets} professional bullet points that:
- Start with strong action verbs
- Are ATS-friendly with industry keywords
- Include quantifiable achievements when possible
- Are concise (max 25 words each)
- Follow the STAR method (Situation, Task, Action, Result)
- Focus on impact and results

Return ONLY the bullet points, one per line, without numbers or bullet symbols.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text().trim();
    
    // Split by newlines and filter empty lines
    const bullets = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .slice(0, numberOfBullets);

    return bullets;
  } catch (error: any) {
    console.error('AI Enhancement Error:', error);
    throw new AppError('Failed to generate experience bullets with AI', 500);
  }
};

/**
 * Improve project description
 */
export const improveProjectDescription = async (
  projectName: string,
  currentDescription: string,
  technologies: string[]
): Promise<string> => {
  try {
    const model = getModel();
    
    const prompt = `You are an expert resume writer specializing in ATS-friendly content.

Project Name: ${projectName}
Technologies: ${technologies.join(', ')}
Current Description: "${currentDescription}"

Task: Improve this project description to be:
- ATS-friendly with technical keywords
- Concise (2-3 sentences, max 60 words)
- Focused on technical challenges and solutions
- Highlighting impact and results
- Professional and clear

Return ONLY the improved description text, no explanations or formatting.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const improvedText = response.text().trim();

    return improvedText;
  } catch (error: any) {
    console.error('AI Enhancement Error:', error);
    throw new AppError('Failed to improve project description with AI', 500);
  }
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
  try {
    const enhanced: any = {};

    // Enhance summary if provided
    if (resumeData.summary) {
      enhanced.summary = await enhanceSummary(resumeData.summary);
    }

    // Enhance experience if provided
    if (resumeData.experience && resumeData.experience.length > 0) {
      enhanced.experience = await Promise.all(
        resumeData.experience.map(async (exp) => ({
          position: exp.position,
          company: exp.company,
          bullets: await generateExperienceBullets(
            exp.position,
            exp.company,
            exp.description,
            3
          ),
        }))
      );
    }

    // Enhance projects if provided
    if (resumeData.projects && resumeData.projects.length > 0) {
      enhanced.projects = await Promise.all(
        resumeData.projects.map(async (proj) => ({
          name: proj.name,
          description: await improveProjectDescription(
            proj.name,
            proj.description,
            proj.technologies
          ),
        }))
      );
    }

    return enhanced;
  } catch (error: any) {
    console.error('AI Enhancement Error:', error);
    throw new AppError('Failed to enhance resume content with AI', 500);
  }
};

/**
 * Generate skills suggestions based on job title and experience
 */
export const generateSkillsSuggestions = async (
  jobTitle: string,
  experienceLevel: 'junior' | 'mid' | 'senior',
  currentSkills: string[]
): Promise<string[]> => {
  try {
    const model = getModel();
    
    const prompt = `You are an expert resume writer specializing in ATS-friendly content.

Job Title: ${jobTitle}
Experience Level: ${experienceLevel}
Current Skills: ${currentSkills.join(', ')}

Task: Suggest 5-8 additional relevant skills that:
- Are highly relevant to this job title
- Match the experience level
- Are ATS-friendly and commonly searched by recruiters
- Complement the current skills without duplication
- Include both technical and soft skills

Return ONLY the skill names, one per line, no explanations or categories.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text().trim();
    
    // Split by newlines and filter empty lines
    const skills = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !currentSkills.includes(line))
      .slice(0, 8);

    return skills;
  } catch (error: any) {
    console.error('AI Enhancement Error:', error);
    throw new AppError('Failed to generate skills suggestions with AI', 500);
  }
};
