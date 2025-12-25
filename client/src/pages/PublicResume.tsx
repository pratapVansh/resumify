import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Download, Share2, ExternalLink, Mail, Phone, MapPin, Globe } from 'lucide-react';
import { getPublicResume } from '../services/resumeService';
import { downloadPublicResume, triggerDownload } from '../services/uploadService';
import PageLoader from '../components/common/PageLoader';
import { FadeIn, SlideIn } from '../components/common/Animations';

interface Resume {
  _id: string;
  title: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    location?: string;
    website?: string;
    linkedin?: string;
    github?: string;
    profilePhoto?: string;
  };
  summary?: string;
  experience: Array<{
    company: string;
    position: string;
    location?: string;
    startDate: Date;
    endDate?: Date;
    current: boolean;
    description: string;
    achievements?: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    location?: string;
    startDate: Date;
    endDate?: Date;
    current: boolean;
    gpa?: string;
    achievements?: string[];
  }>;
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
    startDate?: Date;
    endDate?: Date;
    url?: string;
    github?: string;
    highlights?: string[];
  }>;
  skills: string[];
  languages?: string[];
  certifications?: string[];
  templateSettings: {
    primaryColor: string;
    template: string;
  };
}

const PublicResume: React.FC = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (shareId) {
      fetchResume();
    }
  }, [shareId]);

  const fetchResume = async () => {
    try {
      setLoading(true);
      const response = await getPublicResume(shareId!);
      setResume(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Resume not found');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!shareId) return;
    
    setDownloading(true);
    try {
      const blob = await downloadPublicResume(shareId);
      const filename = `${resume?.personalInfo.firstName}_${resume?.personalInfo.lastName}_Resume.pdf`;
      triggerDownload(blob, filename);
    } catch (err: any) {
      console.error('Download failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: `${resume?.personalInfo.firstName} ${resume?.personalInfo.lastName}'s Resume`,
        text: 'Check out my professional resume',
        url: url,
      });
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  const formatDate = (date: Date | undefined): string => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  if (loading) {
    return <PageLoader text="Loading resume..." />;
  }

  if (error || !resume) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Resume Not Found</h1>
          <p className="text-gray-600 mb-8">{error || 'This resume is not available or has been removed.'}</p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Homepage
          </a>
        </div>
      </div>
    );
  }

  const { personalInfo, summary, experience, education, projects, skills, languages, certifications } = resume;
  const fullName = `${personalInfo.firstName} ${personalInfo.lastName}`;

  return (
    <>
      {/* SEO Meta Tags */}
      <Helmet>
        <title>{fullName} - Professional Resume</title>
        <meta name="description" content={summary || `Professional resume of ${fullName}`} />
        <meta property="og:title" content={`${fullName} - Professional Resume`} />
        <meta property="og:description" content={summary || `Professional resume of ${fullName}`} />
        <meta property="og:type" content="profile" />
        <meta property="og:url" content={window.location.href} />
        {personalInfo.profilePhoto && (
          <meta property="og:image" content={personalInfo.profilePhoto} />
        )}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${fullName} - Professional Resume`} />
        <meta name="twitter:description" content={summary || `Professional resume of ${fullName}`} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={window.location.href} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Action Bar */}
        <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: resume.templateSettings.primaryColor }}
              />
              <span className="font-semibold text-gray-900">Resumify</span>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </button>
              
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {downloading ? 'Downloading...' : 'Download PDF'}
              </button>
            </div>
          </div>
        </div>

        {/* Resume Content */}
        <div className="max-w-4xl mx-auto px-4 py-12">
          <FadeIn>
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              {/* Header */}
              <div 
                className="px-8 py-12 text-white"
                style={{ 
                  background: `linear-gradient(135deg, ${resume.templateSettings.primaryColor} 0%, ${resume.templateSettings.primaryColor}dd 100%)` 
                }}
              >
                <div className="flex flex-col md:flex-row items-center gap-6">
                  {personalInfo.profilePhoto && (
                    <SlideIn direction="left">
                      <img
                        src={personalInfo.profilePhoto}
                        alt={fullName}
                        className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                      />
                    </SlideIn>
                  )}
                  
                  <div className="flex-1 text-center md:text-left">
                    <SlideIn direction="right">
                      <h1 className="text-4xl md:text-5xl font-bold mb-2">{fullName}</h1>
                      
                      <div className="flex flex-wrap justify-center md:justify-start gap-4 text-white/90">
                        {personalInfo.email && (
                          <a href={`mailto:${personalInfo.email}`} className="flex items-center gap-1 hover:text-white transition-colors">
                            <Mail className="w-4 h-4" />
                            {personalInfo.email}
                          </a>
                        )}
                        {personalInfo.phone && (
                          <a href={`tel:${personalInfo.phone}`} className="flex items-center gap-1 hover:text-white transition-colors">
                            <Phone className="w-4 h-4" />
                            {personalInfo.phone}
                          </a>
                        )}
                        {personalInfo.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {personalInfo.location}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-3">
                        {personalInfo.website && (
                          <a 
                            href={personalInfo.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-white/90 hover:text-white transition-colors"
                          >
                            <Globe className="w-4 h-4" />
                            Website
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        {personalInfo.linkedin && (
                          <a 
                            href={personalInfo.linkedin.startsWith('http') ? personalInfo.linkedin : `https://${personalInfo.linkedin}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-white/90 hover:text-white transition-colors"
                          >
                            LinkedIn
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        {personalInfo.github && (
                          <a 
                            href={personalInfo.github.startsWith('http') ? personalInfo.github : `https://github.com/${personalInfo.github}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-white/90 hover:text-white transition-colors"
                          >
                            GitHub
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </SlideIn>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-8">
                {/* Summary */}
                {summary && (
                  <SlideIn direction="up" delay={100}>
                    <section>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <div className="w-1 h-6 rounded" style={{ backgroundColor: resume.templateSettings.primaryColor }} />
                        Professional Summary
                      </h2>
                      <p className="text-gray-700 leading-relaxed">{summary}</p>
                    </section>
                  </SlideIn>
                )}

                {/* Experience */}
                {experience && experience.length > 0 && (
                  <SlideIn direction="up" delay={200}>
                    <section>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <div className="w-1 h-6 rounded" style={{ backgroundColor: resume.templateSettings.primaryColor }} />
                        Experience
                      </h2>
                      <div className="space-y-6">
                        {experience.map((exp, index) => (
                          <div key={index} className="border-l-2 border-gray-200 pl-4">
                            <h3 className="text-xl font-semibold text-gray-900">{exp.position}</h3>
                            <p className="text-gray-600 font-medium">{exp.company}</p>
                            <p className="text-sm text-gray-500 mb-2">
                              {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                              {exp.location && ` • ${exp.location}`}
                            </p>
                            <p className="text-gray-700 mb-2">{exp.description}</p>
                            {exp.achievements && exp.achievements.length > 0 && (
                              <ul className="list-disc list-inside space-y-1 text-gray-700">
                                {exp.achievements.map((achievement, i) => (
                                  <li key={i}>{achievement}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    </section>
                  </SlideIn>
                )}

                {/* Projects */}
                {projects && projects.length > 0 && (
                  <SlideIn direction="up" delay={300}>
                    <section>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <div className="w-1 h-6 rounded" style={{ backgroundColor: resume.templateSettings.primaryColor }} />
                        Projects
                      </h2>
                      <div className="space-y-6">
                        {projects.map((project, index) => (
                          <div key={index} className="border-l-2 border-gray-200 pl-4">
                            <h3 className="text-xl font-semibold text-gray-900">{project.name}</h3>
                            <p className="text-gray-700 mb-2">{project.description}</p>
                            {project.technologies && project.technologies.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-2">
                                {project.technologies.map((tech, i) => (
                                  <span 
                                    key={i} 
                                    className="px-2 py-1 text-xs font-medium rounded"
                                    style={{ 
                                      backgroundColor: `${resume.templateSettings.primaryColor}15`,
                                      color: resume.templateSettings.primaryColor 
                                    }}
                                  >
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            )}
                            {(project.url || project.github) && (
                              <div className="flex gap-4 text-sm">
                                {project.url && (
                                  <a 
                                    href={project.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 hover:underline"
                                    style={{ color: resume.templateSettings.primaryColor }}
                                  >
                                    Live Demo
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                                {project.github && (
                                  <a 
                                    href={project.github} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 hover:underline"
                                    style={{ color: resume.templateSettings.primaryColor }}
                                  >
                                    GitHub
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </section>
                  </SlideIn>
                )}

                {/* Education */}
                {education && education.length > 0 && (
                  <SlideIn direction="up" delay={400}>
                    <section>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <div className="w-1 h-6 rounded" style={{ backgroundColor: resume.templateSettings.primaryColor }} />
                        Education
                      </h2>
                      <div className="space-y-6">
                        {education.map((edu, index) => (
                          <div key={index} className="border-l-2 border-gray-200 pl-4">
                            <h3 className="text-xl font-semibold text-gray-900">
                              {edu.degree} in {edu.field}
                            </h3>
                            <p className="text-gray-600 font-medium">{edu.institution}</p>
                            <p className="text-sm text-gray-500 mb-2">
                              {formatDate(edu.startDate)} - {edu.current ? 'Present' : formatDate(edu.endDate)}
                              {edu.location && ` • ${edu.location}`}
                            </p>
                            {edu.gpa && <p className="text-gray-700">GPA: {edu.gpa}</p>}
                          </div>
                        ))}
                      </div>
                    </section>
                  </SlideIn>
                )}

                {/* Skills */}
                {skills && skills.length > 0 && (
                  <SlideIn direction="up" delay={500}>
                    <section>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <div className="w-1 h-6 rounded" style={{ backgroundColor: resume.templateSettings.primaryColor }} />
                        Skills
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill, index) => (
                          <span 
                            key={index} 
                            className="px-4 py-2 rounded-lg font-medium"
                            style={{ 
                              backgroundColor: `${resume.templateSettings.primaryColor}15`,
                              color: resume.templateSettings.primaryColor 
                            }}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </section>
                  </SlideIn>
                )}

                {/* Languages */}
                {languages && languages.length > 0 && (
                  <SlideIn direction="up" delay={600}>
                    <section>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <div className="w-1 h-6 rounded" style={{ backgroundColor: resume.templateSettings.primaryColor }} />
                        Languages
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {languages.map((lang, index) => (
                          <span 
                            key={index} 
                            className="px-4 py-2 rounded-lg font-medium"
                            style={{ 
                              backgroundColor: `${resume.templateSettings.primaryColor}15`,
                              color: resume.templateSettings.primaryColor 
                            }}
                          >
                            {lang}
                          </span>
                        ))}
                      </div>
                    </section>
                  </SlideIn>
                )}

                {/* Certifications */}
                {certifications && certifications.length > 0 && (
                  <SlideIn direction="up" delay={700}>
                    <section>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <div className="w-1 h-6 rounded" style={{ backgroundColor: resume.templateSettings.primaryColor }} />
                        Certifications
                      </h2>
                      <ul className="space-y-2">
                        {certifications.map((cert, index) => (
                          <li key={index} className="flex items-center gap-2 text-gray-700">
                            <div 
                              className="w-2 h-2 rounded-full" 
                              style={{ backgroundColor: resume.templateSettings.primaryColor }}
                            />
                            {cert}
                          </li>
                        ))}
                      </ul>
                    </section>
                  </SlideIn>
                )}
              </div>
            </div>
          </FadeIn>

          {/* Footer */}
          <div className="mt-12 text-center text-gray-600">
            <p className="mb-4">Created with <span className="text-red-500">♥</span> using Resumify</p>
            <a 
              href="/" 
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              Create your own professional resume
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default PublicResume;
