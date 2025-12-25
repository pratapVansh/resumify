import { ResumeFormData } from '@/types';
import { formatDate } from '@/utils/helpers';
import { Mail, Phone, MapPin, Globe, Linkedin, Github } from 'lucide-react';

interface ResumePreviewProps {
  data: Partial<ResumeFormData>;
}

export default function ResumePreview({ data }: ResumePreviewProps) {
  const { personalInfo, summary, experience, education, projects, skills, languages, certifications } =
    data;

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 min-h-[1056px]" style={{ width: '816px' }}>
      {/* Header */}
      {personalInfo && (
        <div className="mb-6 pb-6 border-b-2 border-primary-600">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {personalInfo.firstName} {personalInfo.lastName}
          </h1>

          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600">
            {personalInfo.email && (
              <div className="flex items-center gap-1">
                <Mail size={14} />
                <span>{personalInfo.email}</span>
              </div>
            )}
            {personalInfo.phone && (
              <div className="flex items-center gap-1">
                <Phone size={14} />
                <span>{personalInfo.phone}</span>
              </div>
            )}
            {personalInfo.location && (
              <div className="flex items-center gap-1">
                <MapPin size={14} />
                <span>{personalInfo.location}</span>
              </div>
            )}
            {personalInfo.website && (
              <div className="flex items-center gap-1">
                <Globe size={14} />
                <a href={personalInfo.website} className="text-primary-600 hover:underline">
                  Website
                </a>
              </div>
            )}
            {personalInfo.linkedin && (
              <div className="flex items-center gap-1">
                <Linkedin size={14} />
                <a href={personalInfo.linkedin} className="text-primary-600 hover:underline">
                  LinkedIn
                </a>
              </div>
            )}
            {personalInfo.github && (
              <div className="flex items-center gap-1">
                <Github size={14} />
                <a href={personalInfo.github} className="text-primary-600 hover:underline">
                  GitHub
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Summary */}
      {summary && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-3 border-b border-gray-300 pb-1">
            Summary
          </h2>
          <p className="text-gray-700 leading-relaxed">{summary}</p>
        </div>
      )}

      {/* Experience */}
      {experience && experience.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-3 border-b border-gray-300 pb-1">
            Experience
          </h2>
          <div className="space-y-4">
            {experience.map((exp, index) => (
              <div key={index}>
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h3 className="font-semibold text-gray-900">{exp.position}</h3>
                    <p className="text-gray-700">{exp.company}</p>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    {exp.location && <p>{exp.location}</p>}
                    <p>
                      {exp.startDate ? formatDate(exp.startDate) : ''} -{' '}
                      {exp.current ? 'Present' : exp.endDate ? formatDate(exp.endDate) : ''}
                    </p>
                  </div>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                  {exp.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-3 border-b border-gray-300 pb-1">
            Education
          </h2>
          <div className="space-y-4">
            {education.map((edu, index) => (
              <div key={index}>
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h3 className="font-semibold text-gray-900">{edu.institution}</h3>
                    <p className="text-gray-700">
                      {edu.degree} in {edu.field}
                    </p>
                    {edu.gpa && <p className="text-sm text-gray-600">GPA: {edu.gpa}</p>}
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    {edu.location && <p>{edu.location}</p>}
                    <p>
                      {edu.startDate ? formatDate(edu.startDate) : ''} -{' '}
                      {edu.current ? 'Present' : edu.endDate ? formatDate(edu.endDate) : ''}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-3 border-b border-gray-300 pb-1">
            Projects
          </h2>
          <div className="space-y-4">
            {projects.map((project, index) => (
              <div key={index}>
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-gray-900">{project.name}</h3>
                  <div className="flex gap-2 text-sm">
                    {project.url && (
                      <a href={project.url} className="text-primary-600 hover:underline">
                        Demo
                      </a>
                    )}
                    {project.github && (
                      <a href={project.github} className="text-primary-600 hover:underline">
                        GitHub
                      </a>
                    )}
                  </div>
                </div>
                <p className="text-gray-700 text-sm mb-1">{project.description}</p>
                {project.technologies && project.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {(typeof project.technologies === 'string'
                      ? project.technologies.split(',')
                      : project.technologies
                    ).map((tech, techIndex) => (
                      <span
                        key={techIndex}
                        className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded"
                      >
                        {tech.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {skills && skills.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-3 border-b border-gray-300 pb-1">
            Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <span key={index} className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Languages */}
      {languages && languages.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-3 border-b border-gray-300 pb-1">
            Languages
          </h2>
          <div className="flex flex-wrap gap-2">
            {languages.map((lang, index) => (
              <span key={index} className="text-gray-700">
                {lang}
                {index < languages.length - 1 && <span className="mx-2">•</span>}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {certifications && certifications.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-3 border-b border-gray-300 pb-1">
            Certifications
          </h2>
          <ul className="list-disc list-inside space-y-1">
            {certifications.map((cert, index) => (
              <li key={index} className="text-gray-700">
                {cert}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
