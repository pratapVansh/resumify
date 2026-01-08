import puppeteer, { Browser, Page } from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { IResume } from '../models/Resume.js';
import { AppError } from '../utils/AppError.js';

/**
 * Generate inline SVG icon for PDF export
 */
const getIconSVG = (type: 'mail' | 'phone' | 'mapPin' | 'globe' | 'linkedin' | 'github', color: string = 'currentColor'): string => {
  const icons: Record<string, string> = {
    mail: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;margin-right:4px"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`,
    phone: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;margin-right:4px"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
    mapPin: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;margin-right:4px"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`,
    globe: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>`,
    linkedin: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>`,
    github: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>`
  };
  
  return icons[type] || '';
};

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
 * Get template-specific styles
 */
interface TemplateStyles {
  headerClass: string;
  sectionClass: string;
  headerStyle: string;
  sectionTitleStyle: string;
  skillTagStyle: string;
}

const getTemplateStyles = (template: string, colorScheme: any, fontFamily: string): TemplateStyles => {
  const templates: Record<string, TemplateStyles> = {
    classic: {
      headerClass: 'header-classic',
      sectionClass: 'section-classic',
      headerStyle: `
        text-align: center;
        padding-bottom: 16px;
        border-bottom: 2px solid ${colorScheme.primary};
        margin-bottom: 20px;
        font-family: 'Merriweather', Georgia, serif;
      `,
      sectionTitleStyle: `
        border-bottom: 1px solid ${colorScheme.border};
        text-decoration: underline;
        text-decoration-color: ${colorScheme.primary};
        text-decoration-thickness: 2px;
      `,
      skillTagStyle: `
        background: ${colorScheme.primary}10;
        color: ${colorScheme.primary};
        border: 1px solid ${colorScheme.primary}30;
      `,
    },
    modern: {
      headerClass: 'header-modern',
      sectionClass: 'section-modern',
      headerStyle: `
        background: linear-gradient(135deg, ${colorScheme.primary} 0%, ${colorScheme.primary}dd 100%);
        color: white;
        padding: 24px;
        margin: 0 0 20px 0;
        text-align: center;
      `,
      sectionTitleStyle: `
        border-left: 4px solid ${colorScheme.primary};
        padding-left: 12px;
        background: ${colorScheme.primary}05;
      `,
      skillTagStyle: `
        background: ${colorScheme.primary}20;
        color: ${colorScheme.text};
        border-radius: 6px;
      `,
    },
    minimal: {
      headerClass: 'header-minimal',
      sectionClass: 'section-minimal',
      headerStyle: `
        text-align: center;
        padding-bottom: 12px;
        border-bottom: 1px solid ${colorScheme.border};
        margin-bottom: 24px;
      `,
      sectionTitleStyle: `
        font-weight: 600;
        color: ${colorScheme.text};
        margin-bottom: 16px;
      `,
      skillTagStyle: `
        color: ${colorScheme.primary};
        font-weight: 600;
        background: transparent;
      `,
    },
    professional: {
      headerClass: 'header-professional',
      sectionClass: 'section-professional',
      headerStyle: `
        background: ${colorScheme.primary};
        color: white;
        padding: 24px;
        margin: 0 0 20px 0;
        text-align: center;
      `,
      sectionTitleStyle: `
        border-bottom: 2px solid ${colorScheme.primary}30;
        padding-bottom: 6px;
      `,
      skillTagStyle: `
        background: ${colorScheme.primary};
        color: white;
        padding: 6px 14px;
        border-radius: 20px;
        font-weight: 500;
      `,
    },
    creative: {
      headerClass: 'header-creative',
      sectionClass: 'section-creative',
      headerStyle: `
        text-align: center;
        padding-bottom: 16px;
        border-bottom: 4px dashed ${colorScheme.primary};
        margin-bottom: 20px;
      `,
      sectionTitleStyle: `
        background: ${colorScheme.primary}15;
        padding: 12px;
        border-left: 4px solid ${colorScheme.primary};
        border-radius: 4px;
      `,
      skillTagStyle: `
        background: ${colorScheme.primary};
        color: white;
        padding: 6px 14px;
        border-radius: 4px;
        transform: skewX(-5deg);
        display: inline-block;
      `,
    },
    executive: {
      headerClass: 'header-executive',
      sectionClass: 'section-executive',
      headerStyle: `
        text-align: center;
        padding-bottom: 16px;
        border-bottom: 1px solid ${colorScheme.primary};
        margin-bottom: 20px;
        font-family: 'Merriweather', Georgia, serif;
      `,
      sectionTitleStyle: `
        text-transform: uppercase;
        letter-spacing: 2px;
        font-weight: 700;
        border-bottom: 1px solid ${colorScheme.border};
        padding-bottom: 6px;
      `,
      skillTagStyle: `
        background: ${colorScheme.primary}10;
        color: ${colorScheme.primary};
        text-transform: uppercase;
        letter-spacing: 1px;
        font-weight: 600;
        font-size: 10px;
      `,
    },
    compact: {
      headerClass: 'header-compact',
      sectionClass: 'section-compact',
      headerStyle: `
        text-align: center;
        padding-bottom: 10px;
        border-bottom: 1px solid ${colorScheme.primary};
        margin-bottom: 12px;
      `,
      sectionTitleStyle: `
        border-bottom: 1px solid ${colorScheme.border};
        padding-bottom: 4px;
        margin-bottom: 8px;
      `,
      skillTagStyle: `
        background: ${colorScheme.primary}15;
        color: ${colorScheme.primary};
        padding: 3px 10px;
        font-size: 10px;
      `,
    },
  };

  return templates[template] || templates.modern;
};

/**
 * Generate HTML template for resume based on template settings
 */
const generateResumeHTML = (resume: IResume): string => {
  const { personalInfo, summary, experience, education, projects, coursework, technicalSkills, skills, languages, achievements, certifications, templateSettings } = resume;
  
  // Map colorTheme to actual color values
  const colorThemeMap: Record<string, string> = {
    blue: '#2563eb',
    green: '#059669',
    red: '#dc2626',
    purple: '#7c3aed',
    orange: '#ea580c',
    teal: '#0d9488',
    gray: '#475569',
    black: '#171717',
    maroon: '#881337',
  };

  // Get template type
  const templateType = templateSettings.template || 'modern';

  // Get primary color from colorTheme or fallback to primaryColor
  const primaryColor = templateSettings.colorTheme 
    ? colorThemeMap[templateSettings.colorTheme] || templateSettings.primaryColor || '#2563eb'
    : templateSettings.primaryColor || '#2563eb';
  
  // Color scheme based on template
  const colorScheme = {
    primary: primaryColor,
    secondary: `${primaryColor}20`,
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

  // Use serif for classic and executive templates
  const actualFontFamily = (templateType === 'classic' || templateType === 'executive') 
    ? "'Merriweather', 'Georgia', serif" 
    : fontFamily;

  // Font size mapping
  const fontSizes = {
    small: { base: '10px', name: '24px', heading: '16px', subheading: '12px' },
    medium: { base: '11px', name: '28px', heading: '18px', subheading: '13px' },
    large: { base: '12px', name: '32px', heading: '20px', subheading: '14px' },
  }[templateSettings.fontSize || 'medium'];

  // Adjust spacing for compact template
  const baseSpacing = templateSettings.spacing || 'normal';
  const actualSpacing = templateType === 'compact' ? 'compact' : baseSpacing;

  // Spacing mapping
  const spacing = {
    compact: { section: '10px', item: '6px' },
    normal: { section: '16px', item: '12px' },
    spacious: { section: '24px', item: '16px' },
  }[actualSpacing];

  // Get template-specific styles
  const templateStyles = getTemplateStyles(templateType, colorScheme, actualFontFamily);

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
          font-family: ${actualFontFamily};
          font-size: ${fontSizes.base};
          color: ${colorScheme.text};
          line-height: 1.6;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          margin: 0;
          padding: 0;
        }
        
        .container {
          max-width: 8.5in;
          margin: 0 auto;
          padding: 0;
          background: white;
        }
        
        .content-wrapper {
          padding: 0.5in;
        }
        
        .header {
          ${templateStyles.headerStyle}
        }

        /* Modern and Professional template header text color */
        .header-modern .name,
        .header-modern .contact-info,
        .header-modern .contact-item,
        .header-professional .name,
        .header-professional .contact-info,
        .header-professional .contact-item {
          color: white !important;
        }
        
        .name {
          font-size: ${fontSizes.name};
          font-weight: 700;
          color: ${(templateType === 'modern' || templateType === 'professional') ? 'white' : colorScheme.primary};
          margin-bottom: 8px;
        }
        
        .contact-info {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 12px;
          font-size: ${fontSizes.base};
          color: ${(templateType === 'modern' || templateType === 'professional') ? 'rgba(255,255,255,0.9)' : colorScheme.textLight};
        }
        
        .contact-item {
          display: inline-block;
          color: ${(templateType === 'modern' || templateType === 'professional') ? 'rgba(255,255,255,0.9)' : colorScheme.textLight};
        }
        
        .contact-item:not(:last-child)::after {
          content: "•";
          margin-left: 12px;
          color: ${(templateType === 'modern' || templateType === 'professional') ? 'rgba(255,255,255,0.9)' : colorScheme.textLight};
        }
        
        .contact-link {
          color: inherit;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        
        .contact-link:hover {
          opacity: 0.8;
        }
        
        .section {
          margin-bottom: ${spacing.section};
        }
        
        .section-title {
          font-size: ${fontSizes.heading};
          font-weight: 700;
          color: ${(templateType === 'executive') ? colorScheme.text : colorScheme.primary};
          margin-bottom: ${spacing.item};
          padding-bottom: 4px;
          ${templateStyles.sectionTitleStyle}
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
          border-radius: 4px;
          font-size: ${fontSizes.base};
          font-weight: 500;
          ${templateStyles.skillTagStyle}
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
        <div class="header ${templateStyles.headerClass}">
          <div class="name">${personalInfo.firstName} ${personalInfo.lastName}</div>
          <div class="contact-info">
            ${personalInfo.email ? `<span class="contact-item">${getIconSVG('mail', (templateType === 'modern' || templateType === 'professional') ? 'rgba(255,255,255,0.9)' : colorScheme.textLight)}${personalInfo.email}</span>` : ''}
            ${personalInfo.phone ? `<span class="contact-item">${getIconSVG('phone', (templateType === 'modern' || templateType === 'professional') ? 'rgba(255,255,255,0.9)' : colorScheme.textLight)}${personalInfo.phone}</span>` : ''}
            ${personalInfo.location ? `<span class="contact-item">${getIconSVG('mapPin', (templateType === 'modern' || templateType === 'professional') ? 'rgba(255,255,255,0.9)' : colorScheme.textLight)}${personalInfo.location}</span>` : ''}
            ${personalInfo.website ? `<span class="contact-item"><a href="${personalInfo.website}" class="contact-link" target="_blank" rel="noopener noreferrer" title="Website">${getIconSVG('globe', (templateType === 'modern' || templateType === 'professional') ? 'rgba(255,255,255,0.9)' : colorScheme.primary)}</a></span>` : ''}
            ${personalInfo.linkedin ? `<span class="contact-item"><a href="${personalInfo.linkedin}" class="contact-link" target="_blank" rel="noopener noreferrer" title="LinkedIn">${getIconSVG('linkedin', (templateType === 'modern' || templateType === 'professional') ? 'rgba(255,255,255,0.9)' : colorScheme.primary)}</a></span>` : ''}
            ${personalInfo.github ? `<span class="contact-item"><a href="${personalInfo.github}" class="contact-link" target="_blank" rel="noopener noreferrer" title="GitHub">${getIconSVG('github', (templateType === 'modern' || templateType === 'professional') ? 'rgba(255,255,255,0.9)' : colorScheme.primary)}</a></span>` : ''}
          </div>
        </div>

        <div class="content-wrapper">
        <!-- Summary -->
        ${summary ? `
        <div class="section ${templateStyles.sectionClass}">
          <div class="section-title">${templateType === 'executive' ? 'PROFESSIONAL SUMMARY' : 'Professional Summary'}</div>
          <div class="section-content">
            <p class="summary">${summary}</p>
          </div>
        </div>
        ` : ''}

        <!-- Experience -->
        ${experience && experience.length > 0 ? `
        <div class="section ${templateStyles.sectionClass}">
          <div class="section-title">${templateType === 'executive' ? 'PROFESSIONAL EXPERIENCE' : 'Professional Experience'}</div>
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
        <div class="section ${templateStyles.sectionClass}">
          <div class="section-title">${templateType === 'executive' ? 'PROJECTS' : 'Projects'}</div>
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
        <div class="section ${templateStyles.sectionClass}">
          <div class="section-title">${templateType === 'executive' ? 'EDUCATION' : 'Education'}</div>
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

        <!-- Relevant Coursework -->
        ${coursework && coursework.length > 0 ? `
        <div class="section ${templateStyles.sectionClass}">
          <div class="section-title">${templateType === 'executive' ? 'RELEVANT COURSEWORK' : 'Relevant Coursework'}</div>
          <div class="section-content">
            <p class="summary">${coursework.map(course => course.name).join(', ')}</p>
          </div>
        </div>
        ` : ''}

        <!-- Technical Skills -->
        ${technicalSkills && technicalSkills.length > 0 ? `
        <div class="section ${templateStyles.sectionClass}">
          <div class="section-title">${templateType === 'executive' ? 'TECHNICAL SKILLS' : 'Technical Skills'}</div>
          <div class="section-content">
            ${technicalSkills.map(skillCat => `
              <div class="item-description" style="margin-bottom: 8px;">
                <strong>${skillCat.category}:</strong> ${skillCat.items.join(', ')}
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}

        <!-- Skills -->
        ${skills && skills.length > 0 ? `
        <div class="section ${templateStyles.sectionClass}">
          <div class="section-title">${templateType === 'executive' ? 'SKILLS' : 'Skills'}</div>
          <div class="section-content">
            <p style="color: ${colorScheme.textLight}; line-height: 1.6;">
              ${skills.join(', ')}
            </p>
          </div>
        </div>
        ` : ''}

        <!-- Languages -->
        ${languages && languages.length > 0 ? `
        <div class="section ${templateStyles.sectionClass}">
          <div class="section-title">${templateType === 'executive' ? 'LANGUAGES' : 'Languages'}</div>
          <div class="section-content">
            <p style="color: ${colorScheme.textLight}; line-height: 1.6;">
              ${languages.join(', ')}
            </p>
          </div>
        </div>
        ` : ''}

        <!-- Achievements -->
        ${achievements && achievements.length > 0 ? `
        <div class="section ${templateStyles.sectionClass}">
          <div class="section-title">${templateType === 'executive' ? 'ACHIEVEMENTS' : 'Achievements'}</div>
          <div class="section-content">
            <ul class="achievements">
              ${achievements.map(achievement => `<li>${achievement}</li>`).join('')}
            </ul>
          </div>
        </div>
        ` : ''}

        <!-- Certifications -->
        ${certifications && certifications.length > 0 ? `
        <div class="section ${templateStyles.sectionClass}">
          <div class="section-title">${templateType === 'executive' ? 'CERTIFICATIONS' : 'Certifications'}</div>
          <div class="section-content">
            ${certifications.map(cert => `<div class="item-description">• ${cert}</div>`).join('')}
          </div>
        </div>
        ` : ''}
        </div> <!-- Close content-wrapper -->
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
    console.log('🎨 Generating PDF with template:', resume.templateSettings.template);
    console.log('🎨 Using color theme:', resume.templateSettings.colorTheme);
    
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
        top: '0',
        right: '0',
        bottom: '0',
        left: '0',
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
