import { AppError } from '../utils/AppError';

/**
 * Gemini API response interface
 */
interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}

/**
 * Call Gemini API using REST endpoint
 */
const callGeminiAPI = async (prompt: string): Promise<string> => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new AppError('Gemini API key is not configured', 500);
  }

  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Gemini API Error:', errorData);
      throw new AppError(`Gemini API request failed: ${response.status} ${response.statusText}`, 500);
    }

    const data = await response.json() as GeminiResponse;

    // Extract text from response
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      console.error('Unexpected Gemini API response format:', JSON.stringify(data));
      throw new AppError('Invalid response from Gemini API', 500);
    }

    return text.trim();
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Gemini API call failed:', error);
    throw new AppError('Failed to communicate with AI service', 500);
  }
};

/**
 * Enhance professional summary
 */
export const enhanceSummary = async (currentSummary: string, jobTitle?: string): Promise<string> => {
  try {
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

    const enhancedText = await callGeminiAPI(prompt);
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

    const text = await callGeminiAPI(prompt);
    
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

    const improvedText = await callGeminiAPI(prompt);
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

    const text = await callGeminiAPI(prompt);
    
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

/**
 * Parse resume text into structured JSON data
 * This function extracts information ONLY from the provided text
 * and does NOT generate or hallucinate any missing data
 */
export const parseResumeText = async (extractedText: string): Promise<any> => {
  try {
    const prompt = `You are a strict resume parsing engine. Your ONLY job is to extract information from the resume text provided below and return it as valid JSON.

CRITICAL RULES:
1. Extract ONLY information that is explicitly present in the resume text
2. Do NOT generate, improve, or hallucinate any content
3. Do NOT add data that is not in the original text
4. If a field is not found in the resume, set it to null or empty array
5. Return ONLY valid JSON, no markdown, no explanations, no extra text
6. Do NOT wrap the JSON in code blocks or backticks

Expected JSON Schema:
{
  "name": string | null,
  "email": string | null,
  "phone": string | null,
  "location": string | null,
  "summary": string | null,
  "skills": string[],
  "education": [{
    "institution": string,
    "degree": string,
    "field": string,
    "startDate": string,
    "endDate": string,
    "gpa": string | null
  }],
  "experience": [{
    "company": string,
    "position": string,
    "startDate": string,
    "endDate": string,
    "location": string | null,
    "description": string[]
  }],
  "projects": [{
    "name": string,
    "description": string,
    "technologies": string[],
    "link": string | null
  }]
}

Resume Text to Parse:
---
${extractedText}
---

Return the parsed resume data as valid JSON only:`;

    let jsonText = await callGeminiAPI(prompt);

    // Remove markdown code blocks if present
    jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    // Try to parse the JSON response
    let parsedData;
    try {
      parsedData = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('❌ Failed to parse Gemini JSON response:', parseError);
      console.error('Raw response:', jsonText);
      throw new AppError('AI returned invalid JSON format', 500);
    }

    // Validate and ensure the expected structure
    const validatedData = {
      name: parsedData.name || null,
      email: parsedData.email || null,
      phone: parsedData.phone || null,
      location: parsedData.location || null,
      summary: parsedData.summary || null,
      skills: Array.isArray(parsedData.skills) ? parsedData.skills : [],
      education: Array.isArray(parsedData.education) ? parsedData.education : [],
      experience: Array.isArray(parsedData.experience) ? parsedData.experience : [],
      projects: Array.isArray(parsedData.projects) ? parsedData.projects : [],
    };

    console.log('✅ Resume parsed successfully by Gemini');
    console.log('📊 Extracted data:', {
      hasName: !!validatedData.name,
      hasEmail: !!validatedData.email,
      hasPhone: !!validatedData.phone,
      skillsCount: validatedData.skills.length,
      educationCount: validatedData.education.length,
      experienceCount: validatedData.experience.length,
      projectsCount: validatedData.projects.length,
    });

    return validatedData;
  } catch (error: any) {
    console.error('❌ Resume parsing error:', error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to parse resume with AI', 500);
  }
};
