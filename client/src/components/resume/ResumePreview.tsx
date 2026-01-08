import { ResumeFormData, TemplateSettings } from '@/types';
import { formatDate } from '@/utils/helpers';
import { MailIcon, PhoneIcon, MapPinIcon, GlobeIcon, LinkedinIcon, GithubIcon } from './ResumeIcons';
import { getTemplateById } from '@/config/resumeTemplates';
import { getColorThemeById } from '@/config/colorThemes';

interface ResumePreviewProps {
  data: Partial<ResumeFormData>;
  templateSettings?: TemplateSettings;
}

export default function ResumePreview({ data, templateSettings }: ResumePreviewProps) {
  const { personalInfo, summary, experience, education, projects, coursework, technicalSkills, skills, languages, achievements, certifications } =
    data;

  const template = templateSettings?.template || 'modern';
  const colorTheme = templateSettings?.colorTheme || 'blue';
  
  const templateStyle = getTemplateById(template);
  const colors = getColorThemeById(colorTheme);

  // Dynamic styles based on template and color
  const dynamicStyles = {
    '--theme-primary': colors.primary,
    '--theme-secondary': colors.secondary,
    '--theme-accent': colors.accent,
    '--theme-text': colors.text,
    '--theme-background': colors.background,
  } as React.CSSProperties;

  const getHeaderClassName = () => {
    let baseClass = templateStyle.headerStyle;
    
    if (template === 'modern') {
      return `bg-gradient-to-r text-white p-6 mb-6 rounded-lg ${templateStyle.fontFamily}`;
    } else if (template === 'professional') {
      return `text-white p-6 mb-6 -mx-8 -mt-8 px-8 ${templateStyle.fontFamily}`;
    } else {
      return `${baseClass} ${templateStyle.fontFamily}`;
    }
  };

  const getSectionClassName = () => {
    return `${templateStyle.sectionStyle}`;
  };

  const getSkillClassName = () => {
    if (template === 'professional' || template === 'creative') {
      return 'px-3 py-1 rounded-full text-sm text-white';
    } else if (template === 'modern') {
      return 'px-2 rounded text-sm';
    } else {
      return 'px-3 py-1 rounded-full text-sm';
    }
  };

  return (
    <div 
      className={`bg-white rounded-lg shadow-lg p-8 min-h-[1056px] ${templateStyle.fontFamily}`}
      style={{ width: '816px', ...dynamicStyles }}
    >
      {/* Header */}
      {personalInfo && (
        <div 
          className={getHeaderClassName()}
          style={{
            backgroundColor: (template === 'modern' || template === 'professional') ? colors.primary : 'transparent',
            borderColor: colors.primary,
            color: (template === 'modern' || template === 'professional') ? 'white' : colors.text
          }}
        >
          <h1 className={`text-4xl font-bold mb-2 ${template === 'minimal' ? 'text-3xl' : ''} ${template === 'compact' ? 'text-3xl' : ''}`}>
            {personalInfo.firstName} {personalInfo.lastName}
          </h1>

          <div className={`flex flex-wrap gap-x-4 gap-y-2 text-sm ${(template === 'modern' || template === 'professional') ? 'text-white text-opacity-90' : 'text-gray-600'}`}>
            {personalInfo.email && (
              <a href={`mailto:${personalInfo.email}`} className="flex items-center gap-1 hover:opacity-80 transition-opacity">
                <MailIcon size={14} />
                <span>{personalInfo.email}</span>
              </a>
            )}
            {personalInfo.phone && (
              <a href={`tel:${personalInfo.phone}`} className="flex items-center gap-1 hover:opacity-80 transition-opacity">
                <PhoneIcon size={14} />
                <span>{personalInfo.phone}</span>
              </a>
            )}
            {personalInfo.location && (
              <div className="flex items-center gap-1">
                <MapPinIcon size={14} />
                <span>{personalInfo.location}</span>
              </div>
            )}
            {personalInfo.website && (
              <a 
                href={personalInfo.website} 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:opacity-80 transition-opacity"
                aria-label="Website"
                style={{ color: (template === 'modern' || template === 'professional') ? 'white' : colors.primary }}
              >
                <GlobeIcon size={14} />
              </a>
            )}
            {personalInfo.linkedin && (
              <a 
                href={personalInfo.linkedin} 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:opacity-80 transition-opacity"
                aria-label="LinkedIn"
                style={{ color: (template === 'modern' || template === 'professional') ? 'white' : colors.primary }}
              >
                <LinkedinIcon size={14} />
              </a>
            )}
            {personalInfo.github && (
              <a 
                href={personalInfo.github} 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:opacity-80 transition-opacity"
                aria-label="GitHub"
                style={{ color: (template === 'modern' || template === 'professional') ? 'white' : colors.primary }}
              >
                <GithubIcon size={14} />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Summary */}
      {summary && (
        <div className={`mb-6 ${template === 'compact' ? 'mb-4' : ''}`}>
          <h2 
            className={`text-xl font-bold mb-3 pb-1 ${getSectionClassName()}`}
            style={{ 
              color: colors.text,
              borderColor: colors.primary,
              backgroundColor: template === 'creative' ? colors.secondary : 'transparent'
            }}
          >
            {template === 'executive' ? 'PROFESSIONAL SUMMARY' : 'Summary'}
          </h2>
          <div className="text-gray-700 leading-relaxed whitespace-pre-line">
            {summary.split('\n').map((line, i) => {
              if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
                return <div key={i} className="ml-2">{line}</div>;
              }
              return <div key={i}>{line}</div>;
            })}
          </div>
        </div>
      )}

      {/* Experience */}
      {experience && experience.length > 0 && (
        <div className={`mb-6 ${template === 'compact' ? 'mb-4' : ''}`}>
          <h2 
            className={`text-xl font-bold mb-3 pb-1 ${getSectionClassName()}`}
            style={{ 
              color: colors.text,
              borderColor: colors.primary,
              backgroundColor: template === 'creative' ? colors.secondary : 'transparent'
            }}
          >
            {template === 'executive' ? 'PROFESSIONAL EXPERIENCE' : 'Experience'}
          </h2>
          <div className={`space-y-4 ${template === 'compact' ? 'space-y-3' : ''}`}>
            {experience.map((exp, index) => (
              <div key={index}>
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h3 className="font-semibold" style={{ color: colors.text }}>
                      {exp.position}
                    </h3>
                    <p style={{ color: colors.primary }} className="font-medium">
                      {exp.company}
                    </p>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    {exp.location && <p>{exp.location}</p>}
                    <p>
                      {exp.startDate ? formatDate(exp.startDate) : ''} -{' '}
                      {exp.current ? 'Present' : exp.endDate ? formatDate(exp.endDate) : ''}
                    </p>
                  </div>
                </div>
                <div className="text-gray-700 text-sm whitespace-pre-line">
                  {exp.description.split('\n').map((line, i) => {
                    const trimmedLine = line.trim();
                    if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
                      return <div key={i} className="ml-2">{trimmedLine}</div>;
                    }
                    return trimmedLine ? <div key={i}>{trimmedLine}</div> : null;
                  })}
                </div>
                {exp.achievements && exp.achievements.length > 0 && (
                  <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-gray-700">
                    {exp.achievements.map((achievement, achIndex) => (
                      <li key={achIndex}>{achievement}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <div className={`mb-6 ${template === 'compact' ? 'mb-4' : ''}`}>
          <h2 
            className={`text-xl font-bold mb-3 pb-1 ${getSectionClassName()}`}
            style={{ 
              color: colors.text,
              borderColor: colors.primary,
              backgroundColor: template === 'creative' ? colors.secondary : 'transparent'
            }}
          >
            {template === 'executive' ? 'EDUCATION' : 'Education'}
          </h2>
          <div className={`space-y-4 ${template === 'compact' ? 'space-y-3' : ''}`}>
            {education.map((edu, index) => (
              <div key={index}>
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h3 className="font-semibold" style={{ color: colors.text }}>
                      {edu.degree} in {edu.field}
                    </h3>
                    <p style={{ color: colors.primary }} className="font-medium">
                      {edu.institution}
                    </p>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    {edu.location && <p>{edu.location}</p>}
                    <p>
                      {edu.startDate ? formatDate(edu.startDate) : ''} -{' '}
                      {edu.current ? 'Present' : edu.endDate ? formatDate(edu.endDate) : ''}
                    </p>
                  </div>
                </div>
                {edu.gpa && <p className="text-gray-700 text-sm">GPA: {edu.gpa}</p>}
                {edu.achievements && edu.achievements.length > 0 && (
                  <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-gray-700">
                    {edu.achievements.map((achievement, achIndex) => (
                      <li key={achIndex}>{achievement}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <div className={`mb-6 ${template === 'compact' ? 'mb-4' : ''}`}>
          <h2 
            className={`text-xl font-bold mb-3 pb-1 ${getSectionClassName()}`}
            style={{ 
              color: colors.text,
              borderColor: colors.primary,
              backgroundColor: template === 'creative' ? colors.secondary : 'transparent'
            }}
          >
            {template === 'executive' ? 'PROJECTS' : 'Projects'}
          </h2>
          <div className={`space-y-4 ${template === 'compact' ? 'space-y-3' : ''}`}>
            {projects.map((project, index) => (
              <div key={index}>
                <div className="flex justify-between items-start mb-1">
                  <div className="flex-1">
                    <h3 className="font-semibold" style={{ color: colors.text }}>
                      {project.name}
                    </h3>
                    <div className="flex gap-2 text-sm mt-1">
                      {project.url && (
                        <a 
                          href={project.url} 
                          className="hover:underline"
                          style={{ color: colors.primary }}
                        >
                          Demo
                        </a>
                      )}
                      {project.github && (
                        <a 
                          href={project.github} 
                          className="hover:underline"
                          style={{ color: colors.primary }}
                        >
                          GitHub
                        </a>
                      )}
                    </div>
                  </div>
                  {(project.startDate || project.endDate) && (
                    <div className="text-right text-sm text-gray-600">
                      <p>
                        {project.startDate ? formatDate(project.startDate) : ''}{project.startDate && project.endDate ? ' - ' : project.startDate ? ' - Present' : ''}{project.endDate ? formatDate(project.endDate) : ''}
                      </p>
                    </div>
                  )}
                </div>
                <div className="text-gray-700 text-sm mb-1 whitespace-pre-line">
                  {project.description.split('\n').map((line, i) => {
                    const trimmedLine = line.trim();
                    if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
                      return <div key={i} className="ml-2">{trimmedLine}</div>;
                    }
                    return trimmedLine ? <div key={i}>{trimmedLine}</div> : null;
                  })}
                </div>
                {project.technologies && project.technologies.length > 0 && (
                  <p className="text-gray-700 text-sm">
                    <span className="font-bold">Tech stack: </span>
                    {project.technologies.map((tech: string, techIndex: number) => (
                      <span key={techIndex}>
                        {typeof tech === 'string' ? tech.trim() : tech}
                        {techIndex < project.technologies.length - 1 && ', '}
                      </span>
                    ))}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Relevant Coursework */}
      {coursework && coursework.length > 0 && (
        <div className={`mb-6 ${template === 'compact' ? 'mb-4' : ''}`}>
          <h2 
            className={`text-xl font-bold mb-3 pb-1 ${getSectionClassName()}`}
            style={{ 
              color: colors.text,
              borderColor: colors.primary,
              backgroundColor: template === 'creative' ? colors.secondary : 'transparent'
            }}
          >
            {template === 'executive' ? 'RELEVANT COURSEWORK' : 'Relevant Coursework'}
          </h2>
          <p className="text-gray-700">
            {coursework.map((course, index) => (
              <span key={index}>
                {course.name}
                {index < coursework.length - 1 && ', '}
              </span>
            ))}
          </p>
        </div>
      )}

      {/* Technical Skills */}
      {technicalSkills && technicalSkills.length > 0 && (
        <div className={`mb-6 ${template === 'compact' ? 'mb-4' : ''}`}>
          <h2 
            className={`text-xl font-bold mb-3 pb-1 ${getSectionClassName()}`}
            style={{ 
              color: colors.text,
              borderColor: colors.primary,
              backgroundColor: template === 'creative' ? colors.secondary : 'transparent'
            }}
          >
            {template === 'executive' ? 'TECHNICAL SKILLS' : 'Technical Skills'}
          </h2>
          <div className="space-y-2">
            {technicalSkills.map((skillCat, index) => (
              <div key={index} className="text-gray-700">
                <span className="font-semibold" style={{ color: colors.text }}>{skillCat.category}: </span>
                <span>{skillCat.items.join(', ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {skills && skills.length > 0 && (
        <div className={`mb-6 ${template === 'compact' ? 'mb-4' : ''}`}>
          <h2 
            className={`text-xl font-bold mb-3 pb-1 ${getSectionClassName()}`}
            style={{ 
              color: colors.text,
              borderColor: colors.primary,
              backgroundColor: template === 'creative' ? colors.secondary : 'transparent'
            }}
          >
            {template === 'executive' ? 'SKILLS' : 'Skills'}
          </h2>
          <div className="text-gray-700">
            {skills.map((skill, index) => (
              <span key={index}>
                {typeof skill === 'string' ? skill : skill?.name || JSON.stringify(skill)}
                {index < skills.length - 1 && ', '}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Languages */}
      {languages && languages.length > 0 && (
        <div className={`mb-6 ${template === 'compact' ? 'mb-4' : ''}`}>
          <h2 
            className={`text-xl font-bold mb-3 pb-1 ${getSectionClassName()}`}
            style={{ 
              color: colors.text,
              borderColor: colors.primary,
              backgroundColor: template === 'creative' ? colors.secondary : 'transparent'
            }}
          >
            {template === 'executive' ? 'LANGUAGES' : 'Languages'}
          </h2>
          <div className="flex flex-wrap gap-2">
            {languages.map((lang, index) => (
              <span key={index} className="text-gray-700">
                {typeof lang === 'string' ? lang : lang?.name || JSON.stringify(lang)}
                {index < languages.length - 1 && <span className="mx-2">•</span>}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Achievements */}
      {achievements && achievements.length > 0 && (
        <div className={`mb-6 ${template === 'compact' ? 'mb-4' : ''}`}>
          <h2 
            className={`text-xl font-bold mb-3 pb-1 ${getSectionClassName()}`}
            style={{ 
              color: colors.text,
              borderColor: colors.primary,
              backgroundColor: template === 'creative' ? colors.secondary : 'transparent'
            }}
          >
            {template === 'executive' ? 'ACHIEVEMENTS' : 'Achievements'}
          </h2>
          <ul className="list-disc list-inside space-y-1">
            {achievements.map((achievement, index) => (
              <li key={index} className="text-gray-700">
                {typeof achievement === 'string' ? achievement : achievement?.name || achievement?.description || JSON.stringify(achievement)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Certifications */}
      {certifications && certifications.length > 0 && (
        <div className={`mb-6 ${template === 'compact' ? 'mb-4' : ''}`}>
          <h2 
            className={`text-xl font-bold mb-3 pb-1 ${getSectionClassName()}`}
            style={{ 
              color: colors.text,
              borderColor: colors.primary,
              backgroundColor: template === 'creative' ? colors.secondary : 'transparent'
            }}
          >
            {template === 'executive' ? 'CERTIFICATIONS' : 'Certifications'}
          </h2>
          <ul className="list-disc list-inside space-y-1">
            {certifications.map((cert, index) => (
              <li key={index} className="text-gray-700">
                {typeof cert === 'string' ? cert : cert?.name || cert?.title || JSON.stringify(cert)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
