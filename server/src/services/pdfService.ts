import puppeteer, { Browser, Page } from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { IResume } from '../models/Resume.js';
import { AppError } from '../utils/AppError.js';

/**
 * Get Chromium executable path
 */
const getChromiumPath = async (): Promise<string> => {
  // For local development, use system Chrome
  if (process.env.NODE_ENV === 'development') {
    // Windows Chrome path
    return 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  }
  
  // For production (AWS Lambda, etc.), use chromium package
  return await chromium.executablePath();
};

/**
 * Generate HTML template for resume based on template settings
 */
const generateResumeHTML = (resume: IResume): string => {
  const { personalInfo, summary, experience, education, projects, skills, languages, certifications, templateSettings } = resume;
  
  // Color scheme based on template
  const colorScheme = {
    primary: templateSettings.primaryColor || '#2563eb',
    text: '#1f2937',
    textLight: '#6b7280',
    border: '#e5e7eb',
  };

  // Font settings
  const fontFamily = {
    'sans-serif': "'Inter', 'Helvetica', sans-serif",
    'serif': "'Merriweather', 'Georgia', serif",
    'monospace': "'JetBrains Mono', 'Courier New', monospace",
  }[templateSettings.font || 'sans-serif'];

  // Font size mapping
  const fontSizes = {
    small: { base: '10px', name: '24px', heading: '16px', subheading: '12px' },
    medium: { base: '11px', name: '28px', heading: '18px', subheading: '13px' },
    large: { base: '12px', name: '32px', heading: '20px', subheading: '14px' },
  }[templateSettings.fontSize || 'medium'];

  // Spacing mapping
  const spacing = {
    compact: { section: '12px', item: '8px' },
    normal: { section: '16px', item: '12px' },
    spacious: { section: '24px', item: '16px' },
  }[templateSettings.spacing || 'normal'];

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${personalInfo.firstName} ${personalInfo.lastName} - Resume</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Merriweather:wght@400;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: ${fontFamily};
          font-size: ${fontSizes.base};
          color: ${colorScheme.text};
          line-height: 1.6;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        
        .container {
          max-width: 8.5in;
          margin: 0 auto;
          padding: 0.5in;
          background: white;
        }
        
        .header {
          text-align: center;
          margin-bottom: ${spacing.section};
          padding-bottom: ${spacing.section};
          border-bottom: 2px solid ${colorScheme.primary};
        }
        
        .name {
          font-size: ${fontSizes.name};
          font-weight: 700;
          color: ${colorScheme.primary};
          margin-bottom: 8px;
        }
        
        .contact-info {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 12px;
          font-size: ${fontSizes.base};
          color: ${colorScheme.textLight};
        }
        
        .contact-item {
          display: inline-block;
        }
        
        .contact-item:not(:last-child)::after {
          content: "•";
          margin-left: 12px;
        }
        
        .section {
          margin-bottom: ${spacing.section};
        }
        
        .section-title {
          font-size: ${fontSizes.heading};
          font-weight: 700;
          color: ${colorScheme.primary};
          margin-bottom: ${spacing.item};
          padding-bottom: 4px;
          border-bottom: 1px solid ${colorScheme.border};
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .section-content {
          margin-left: 0;
        }
        
        .summary {
          line-height: 1.7;
          color: ${colorScheme.text};
        }
        
        .item {
          margin-bottom: ${spacing.item};
          page-break-inside: avoid;
        }
        
        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 4px;
        }
        
        .item-title {
          font-size: ${fontSizes.subheading};
          font-weight: 600;
          color: ${colorScheme.text};
        }
        
        .item-subtitle {
          font-size: ${fontSizes.base};
          color: ${colorScheme.textLight};
          font-weight: 500;
        }
        
        .item-date {
          font-size: ${fontSizes.base};
          color: ${colorScheme.textLight};
          white-space: nowrap;
        }
        
        .item-description {
          margin-top: 6px;
          color: ${colorScheme.text};
          line-height: 1.6;
        }
        
        .achievements, .highlights {
          margin-top: 6px;
          padding-left: 18px;
        }
        
        .achievements li, .highlights li {
          margin-bottom: 4px;
          line-height: 1.5;
        }
        
        .skills-container {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .skill-tag {
          display: inline-block;
          padding: 4px 12px;
          background: ${colorScheme.primary}15;
          color: ${colorScheme.primary};
          border-radius: 4px;
          font-size: ${fontSizes.base};
          font-weight: 500;
        }
        
        .technologies {
          margin-top: 6px;
          font-size: ${fontSizes.base};
          color: ${colorScheme.textLight};
        }
        
        .technologies strong {
          color: ${colorScheme.text};
        }
        
        .project-links {
          margin-top: 6px;
          display: flex;
          gap: 12px;
          font-size: ${fontSizes.base};
        }
        
        .project-link {
          color: ${colorScheme.primary};
          text-decoration: none;
        }
        
        @media print {
          body {
            background: white;
          }
          
          .container {
            max-width: 100%;
            padding: 0;
          }
          
          .section {
            page-break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <div class="name">${personalInfo.firstName} ${personalInfo.lastName}</div>
          <div class="contact-info">
            ${personalInfo.email ? `<span class="contact-item">${personalInfo.email}</span>` : ''}
            ${personalInfo.phone ? `<span class="contact-item">${personalInfo.phone}</span>` : ''}
            ${personalInfo.location ? `<span class="contact-item">${personalInfo.location}</span>` : ''}
            ${personalInfo.website ? `<span class="contact-item">${personalInfo.website}</span>` : ''}
            ${personalInfo.linkedin ? `<span class="contact-item">LinkedIn: ${personalInfo.linkedin}</span>` : ''}
            ${personalInfo.github ? `<span class="contact-item">GitHub: ${personalInfo.github}</span>` : ''}
          </div>
        </div>

        <!-- Summary -->
        ${summary ? `
        <div class="section">
          <div class="section-title">Professional Summary</div>
          <div class="section-content">
            <p class="summary">${summary}</p>
          </div>
        </div>
        ` : ''}

        <!-- Experience -->
        ${experience && experience.length > 0 ? `
        <div class="section">
          <div class="section-title">Professional Experience</div>
          <div class="section-content">
            ${experience.map(exp => `
              <div class="item">
                <div class="item-header">
                  <div>
                    <div class="item-title">${exp.position}</div>
                    <div class="item-subtitle">${exp.company}${exp.location ? ` • ${exp.location}` : ''}</div>
                  </div>
                  <div class="item-date">
                    ${formatDate(exp.startDate)} - ${exp.current ? 'Present' : formatDate(exp.endDate)}
                  </div>
                </div>
                ${exp.description ? `<div class="item-description">${exp.description}</div>` : ''}
                ${exp.achievements && exp.achievements.length > 0 ? `
                  <ul class="achievements">
                    ${exp.achievements.map(achievement => `<li>${achievement}</li>`).join('')}
                  </ul>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}

        <!-- Projects -->
        ${projects && projects.length > 0 ? `
        <div class="section">
          <div class="section-title">Projects</div>
          <div class="section-content">
            ${projects.map(project => `
              <div class="item">
                <div class="item-header">
                  <div class="item-title">${project.name}</div>
                  ${project.startDate ? `
                    <div class="item-date">
                      ${formatDate(project.startDate)}${project.endDate ? ` - ${formatDate(project.endDate)}` : ''}
                    </div>
                  ` : ''}
                </div>
                ${project.description ? `<div class="item-description">${project.description}</div>` : ''}
                ${project.technologies && project.technologies.length > 0 ? `
                  <div class="technologies">
                    <strong>Technologies:</strong> ${project.technologies.join(', ')}
                  </div>
                ` : ''}
                ${project.highlights && project.highlights.length > 0 ? `
                  <ul class="highlights">
                    ${project.highlights.map(highlight => `<li>${highlight}</li>`).join('')}
                  </ul>
                ` : ''}
                ${(project.url || project.github) ? `
                  <div class="project-links">
                    ${project.url ? `<a href="${project.url}" class="project-link">Live Demo</a>` : ''}
                    ${project.github ? `<a href="${project.github}" class="project-link">GitHub</a>` : ''}
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}

        <!-- Education -->
        ${education && education.length > 0 ? `
        <div class="section">
          <div class="section-title">Education</div>
          <div class="section-content">
            ${education.map(edu => `
              <div class="item">
                <div class="item-header">
                  <div>
                    <div class="item-title">${edu.degree} in ${edu.field}</div>
                    <div class="item-subtitle">${edu.institution}${edu.location ? ` • ${edu.location}` : ''}</div>
                  </div>
                  <div class="item-date">
                    ${formatDate(edu.startDate)} - ${edu.current ? 'Present' : formatDate(edu.endDate)}
                  </div>
                </div>
                ${edu.gpa ? `<div class="item-description">GPA: ${edu.gpa}</div>` : ''}
                ${edu.achievements && edu.achievements.length > 0 ? `
                  <ul class="achievements">
                    ${edu.achievements.map(achievement => `<li>${achievement}</li>`).join('')}
                  </ul>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}

        <!-- Skills -->
        ${skills && skills.length > 0 ? `
        <div class="section">
          <div class="section-title">Skills</div>
          <div class="section-content">
            <div class="skills-container">
              ${skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
            </div>
          </div>
        </div>
        ` : ''}

        <!-- Languages -->
        ${languages && languages.length > 0 ? `
        <div class="section">
          <div class="section-title">Languages</div>
          <div class="section-content">
            <div class="skills-container">
              ${languages.map(lang => `<span class="skill-tag">${lang}</span>`).join('')}
            </div>
          </div>
        </div>
        ` : ''}

        <!-- Certifications -->
        ${certifications && certifications.length > 0 ? `
        <div class="section">
          <div class="section-title">Certifications</div>
          <div class="section-content">
            ${certifications.map(cert => `<div class="item-description">• ${cert}</div>`).join('')}
          </div>
        </div>
        ` : ''}
      </div>
    </body>
    </html>
  `;

  return html;
};

/**
 * Format date for display
 */
const formatDate = (date: Date | undefined): string => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

/**
 * Generate PDF from resume data
 */
export const generateResumePDF = async (resume: IResume): Promise<Buffer> => {
  let browser: Browser | null = null;

  try {
    // Generate HTML content
    const html = generateResumeHTML(resume);

    // Get Chromium path
    const executablePath = await getChromiumPath();

    // Launch browser
    const launchOptions: any = {
      executablePath,
      headless: true,
    };

    // Add chromium-specific options in production
    if (process.env.NODE_ENV === 'production') {
      launchOptions.args = chromium.args;
    }

    browser = await puppeteer.launch(launchOptions);

    // Create new page
    const page: Page = await browser.newPage();

    // Set content
    await page.setContent(html, {
      waitUntil: 'networkidle0',
    });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in',
      },
      preferCSSPageSize: true,
    });

    return Buffer.from(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new AppError('Failed to generate PDF', 500);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

/**
 * Generate PDF and upload to Cloudinary
 */
export const generateAndUploadResumePDF = async (
  resume: IResume,
  uploadToCloud: (buffer: Buffer, resumeId: string, userId?: string) => Promise<{ url: string; publicId: string; previewUrl: string; viewPdfUrl: string }>,
  userId?: string
): Promise<{ url: string; publicId: string; previewUrl: string; viewPdfUrl: string; buffer: Buffer }> => {
  try {
    console.log('🔄 Starting PDF generation for resume:', resume._id);
    console.log('👤 User ID:', userId);
    
    // Generate PDF buffer
    const pdfBuffer = await generateResumePDF(resume);
    console.log('✅ PDF generated successfully. Size:', Math.round(pdfBuffer.length / 1024), 'KB');

    // Upload to Cloudinary with userId for organized folder structure
    const uploadResult = await uploadToCloud(pdfBuffer, resume._id.toString(), userId);

    return {
      ...uploadResult,
      buffer: pdfBuffer,
    };
  } catch (error) {
    console.error('Error generating and uploading PDF:', error);
    throw new AppError('Failed to generate and upload resume PDF', 500);
  }
};
