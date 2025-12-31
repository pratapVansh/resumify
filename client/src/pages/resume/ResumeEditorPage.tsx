import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createResume, updateResume, fetchResume, updateTemplateSettings } from '@/store/slices/resumeSlice';
import { resumeSchema } from '@/schemas/resumeSchema';
import { ResumeFormData } from '@/types';
import MainLayout from '@/components/layout/MainLayout';
import PersonalInfoSection from '@/components/resume/PersonalInfoSection';
import ExperienceSection from '@/components/resume/ExperienceSection';
import EducationSection from '@/components/resume/EducationSection';
import ProjectsSection from '@/components/resume/ProjectsSection';
import SkillsSection from '@/components/resume/SkillsSection';
import CourseworkSection from '@/components/resume/CourseworkSection';
import TechnicalSkillsSection from '@/components/resume/TechnicalSkillsSection';
import AchievementsSection from '@/components/resume/AchievementsSection';
import CertificationsInput from '@/components/resume/CertificationsInput';
import ResumePreview from '@/components/resume/ResumePreview';
import TemplateSelector from '@/components/resume/TemplateSelector';
import ColorThemeSelector from '@/components/resume/ColorThemeSelector';
import ResumeUploadButton from '@/components/resume/ResumeUploadButton';
import { Save, Eye, EyeOff, CheckCircle, XCircle, Download } from 'lucide-react';
import { downloadResumePDF, triggerDownload } from '@/services/uploadService';

export default function ResumeEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentResume, isLoading } = useAppSelector((state) => state.resume);
  const [activeTab, setActiveTab] = useState('personal');
  const [showPreview, setShowPreview] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [hasImportedData, setHasImportedData] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm<ResumeFormData>({
    resolver: zodResolver(resumeSchema),
    defaultValues: {
      title: '',
      personalInfo: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        location: '',
        website: '',
        linkedin: '',
        github: '',
      },
      summary: '',
      experience: [],
      education: [],
      projects: [],
      coursework: [],
      technicalSkills: [],
      skills: [],
      languages: [],
      achievements: [],
      certifications: [],
      templateSettings: {
        template: 'modern',
        colorTheme: 'blue',
        primaryColor: '#3b82f6',
        fontSize: 'medium',
        spacing: 'normal',
        font: 'sans-serif',
      },
    },
  });

  const formData = watch();

  useEffect(() => {
    if (id && id !== 'new') {
      console.log('📥 Fetching resume with ID:', id);
      dispatch(fetchResume(id));
    } else {
      console.log('🆕 Creating new resume - no fetch needed');
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (currentResume) {
      console.log('📋 Loading resume data into form:', currentResume);
      reset(currentResume);
    }
  }, [currentResume, reset]);

  const onSubmit = async (data: ResumeFormData) => {
    console.log('📝 Submitting resume data:', data);
    console.log('🔑 Resume ID:', id);
    console.log('👤 Is creating new?', !id || id === 'new');
    
    // Clean the data - remove empty arrays and objects that don't meet requirements
    const cleanedData = {
      ...data,
      personalInfo: {
        ...data.personalInfo,
        // Convert empty strings to undefined for optional URL fields
        website: data.personalInfo.website?.trim() || undefined,
        linkedin: data.personalInfo.linkedin?.trim() || undefined,
        github: data.personalInfo.github?.trim() || undefined,
        phone: data.personalInfo.phone?.trim() || undefined,
        location: data.personalInfo.location?.trim() || undefined,
      },
      // Filter out incomplete experience entries
      experience: data.experience?.filter(exp => 
        exp.company && exp.position && exp.startDate && exp.description
      ) || [],
      // Filter out incomplete education entries
      education: data.education?.filter(edu => 
        edu.institution && edu.degree && edu.field && edu.startDate
      ) || [],
      // Filter out incomplete project entries
      projects: data.projects?.filter(proj => 
        proj.name && proj.description && proj.technologies && proj.technologies.length > 0
      ).map(proj => ({
        ...proj,
        url: proj.url?.trim() || undefined,
        github: proj.github?.trim() || undefined,
      })) || [],
      // Filter out empty strings from arrays
      skills: data.skills?.filter(skill => skill && skill.trim() !== '') || [],
      languages: data.languages?.filter(lang => lang && lang.trim() !== '') || [],
      certifications: data.certifications?.filter(cert => cert && cert.trim() !== '') || [],
      // Ensure templateSettings are included with current values
      templateSettings: {
        template: data.templateSettings?.template || 'modern',
        colorTheme: data.templateSettings?.colorTheme || 'blue',
        primaryColor: data.templateSettings?.primaryColor || '#3b82f6',
        fontSize: data.templateSettings?.fontSize || 'medium',
        spacing: data.templateSettings?.spacing || 'normal',
        font: data.templateSettings?.font || 'sans-serif',
      },
    };

    console.log('🧹 Cleaned resume data:', cleanedData);
    console.log('🎨 Template settings:', cleanedData.templateSettings);
    
    try {
      // If no ID or ID is 'new', create a new resume
      if (!id || id === 'new') {
        console.log('🆕 Creating new resume...');
        const result = await dispatch(createResume(cleanedData));
        console.log('📦 Create result:', result);
        
        if (createResume.fulfilled.match(result)) {
          console.log('✅ Resume created:', result.payload);
          // Show success message
          const successDiv = document.createElement('div');
          successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-fade-in';
          successDiv.innerHTML = `
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span>Resume created successfully!</span>
          `;
          document.body.appendChild(successDiv);
          setHasImportedData(false);
          setTimeout(() => {
            successDiv.remove();
            navigate('/dashboard');
          }, 2000);
        } else if (createResume.rejected.match(result)) {
          console.error('❌ Failed to create resume:', result.payload);
          const errorDiv = document.createElement('div');
          errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-fade-in';
          errorDiv.innerHTML = `
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            <span>Failed to create resume: ${result.payload || 'Unknown error'}</span>
          `;
          document.body.appendChild(errorDiv);
          setTimeout(() => errorDiv.remove(), 5000);
        }
      } else if (id) {
        console.log('💾 Updating existing resume:', id);
        console.log('📊 Update payload:', { id, data: cleanedData });
        const result = await dispatch(updateResume({ id, data: cleanedData }));
        console.log('📦 Update result:', result);
        console.log('📦 Result type:', result.type);
        console.log('📦 Result payload:', result.payload);
        
        if (updateResume.fulfilled.match(result)) {
          console.log('✅ Resume updated:', result.payload);
          // Show success message
          const successDiv = document.createElement('div');
          successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-fade-in';
          successDiv.innerHTML = `
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span>Resume saved successfully!</span>
          `;
          document.body.appendChild(successDiv);
          setHasImportedData(false);
          setTimeout(() => successDiv.remove(), 3000);
          // Reset the form with the updated data to clear isDirty state
          reset(result.payload);
          
          // Refetch the resume after delays to get the updated PDF and preview URLs
          // PDF generation happens in the background on the server, so we poll a few times
          const refetchAttempts = [2000, 5000, 10000]; // Try at 2s, 5s, and 10s
          refetchAttempts.forEach((delay) => {
            setTimeout(() => {
              console.log('🔄 Refetching resume to get updated PDF URLs...');
              dispatch(fetchResume(id));
            }, delay);
          });
        } else if (updateResume.rejected.match(result)) {
          console.error('❌ Failed to update resume:', result.payload);
          const errorDiv = document.createElement('div');
          errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-fade-in';
          errorDiv.innerHTML = `
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            <span>Failed to save: ${result.payload || 'Unknown error'}</span>
          `;
          document.body.appendChild(errorDiv);
          setTimeout(() => errorDiv.remove(), 5000);
        }
      }
    } catch (error: any) {
      console.error('❌ Error saving resume:', error);
      console.error('❌ Error stack:', error.stack);
      const errorDiv = document.createElement('div');
      errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-fade-in';
      errorDiv.innerHTML = `
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
        <span>An unexpected error occurred: ${error.message || 'Please try again'}</span>
      `;
      document.body.appendChild(errorDiv);
      setTimeout(() => errorDiv.remove(), 5000);
    }
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info' },
    { id: 'summary', label: 'Summary' },
    { id: 'experience', label: 'Experience' },
    { id: 'education', label: 'Education' },
    { id: 'projects', label: 'Projects' },
    { id: 'coursework', label: 'Coursework' },
    { id: 'technical', label: 'Technical Skills' },
    { id: 'skills', label: 'Skills & Languages' },
    { id: 'achievements', label: 'Achievements' },
    { id: 'certifications', label: 'Certifications' },
  ];

  const handleDownloadPDF = async () => {
    if (!id || id === 'new') {
      alert('Please save the resume first before downloading PDF');
      return;
    }

    // Auto-save if there are unsaved changes
    if (isDirty) {
      const confirmSave = window.confirm('You have unsaved changes. Would you like to save before downloading?');
      if (confirmSave) {
        try {
          await handleSubmit(onSubmit)();
          // Wait a moment for the save to complete
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error('Failed to save before download:', error);
          alert('Please save your changes manually before downloading');
          return;
        }
      }
    }

    setIsDownloading(true);
    try {
      const blob = await downloadResumePDF(id);
      const filename = `${formData.title || 'Resume'}.pdf`;
      triggerDownload(blob, filename);
      
      const successDiv = document.createElement('div');
      successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-fade-in';
      successDiv.innerHTML = `
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span>PDF downloaded successfully!</span>
      `;
      document.body.appendChild(successDiv);
      setTimeout(() => successDiv.remove(), 3000);
    } catch (error: any) {
      console.error('Failed to download PDF:', error);
      const errorDiv = document.createElement('div');
      errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-fade-in';
      errorDiv.innerHTML = `
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
        <span>Failed to download PDF: ${error.response?.data?.message || error.message}</span>
      `;
      document.body.appendChild(errorDiv);
      setTimeout(() => errorDiv.remove(), 5000);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleTemplateChange = (templateId: string) => {
    setValue('templateSettings.template', templateId as any, { shouldDirty: true });
    dispatch(updateTemplateSettings({ template: templateId }));
  };

  const handleColorThemeChange = (colorThemeId: string) => {
    setValue('templateSettings.colorTheme', colorThemeId as any, { shouldDirty: true });
    dispatch(updateTemplateSettings({ colorTheme: colorThemeId }));
  };

  const handleUploadSuccess = (parsedData: any) => {
    console.log('📄 Parsed resume data:', parsedData);
    
    // Populate form with parsed data - all fields remain editable
    if (parsedData.name) {
      const nameParts = parsedData.name.split(' ');
      setValue('personalInfo.firstName', nameParts[0] || '', { shouldDirty: true });
      setValue('personalInfo.lastName', nameParts.slice(1).join(' ') || '', { shouldDirty: true });
    }
    
    if (parsedData.email) setValue('personalInfo.email', parsedData.email, { shouldDirty: true });
    if (parsedData.phone) setValue('personalInfo.phone', parsedData.phone, { shouldDirty: true });
    if (parsedData.location) setValue('personalInfo.location', parsedData.location, { shouldDirty: true });
    if (parsedData.summary) setValue('summary', parsedData.summary, { shouldDirty: true });
    
    if (parsedData.skills && Array.isArray(parsedData.skills)) {
      setValue('skills', parsedData.skills, { shouldDirty: true });
    }
    
    if (parsedData.education && Array.isArray(parsedData.education)) {
      setValue('education', parsedData.education.map((edu: any) => ({
        institution: edu.institution || '',
        degree: edu.degree || '',
        field: edu.field || '',
        startDate: edu.startDate || '',
        endDate: edu.endDate || '',
        gpa: edu.gpa || '',
      })), { shouldDirty: true });
    }
    
    if (parsedData.experience && Array.isArray(parsedData.experience)) {
      setValue('experience', parsedData.experience.map((exp: any) => ({
        company: exp.company || '',
        position: exp.position || '',
        startDate: exp.startDate || '',
        endDate: exp.endDate || '',
        location: exp.location || '',
        description: Array.isArray(exp.description) ? exp.description : [],
      })), { shouldDirty: true });
    }
    
    if (parsedData.projects && Array.isArray(parsedData.projects)) {
      setValue('projects', parsedData.projects.map((proj: any) => ({
        name: proj.name || '',
        description: proj.description || '',
        technologies: Array.isArray(proj.technologies) ? proj.technologies : [],
        link: proj.link || '',
      })), { shouldDirty: true });
    }
    
    // Show warning notification - data is NOT auto-saved
    const warningDiv = document.createElement('div');
    warningDiv.className = 'fixed top-4 right-4 bg-amber-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 animate-fade-in max-w-md';
    warningDiv.innerHTML = `
      <div class="flex items-start gap-3">
        <svg class="w-6 h-6 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
        </svg>
        <div>
          <p class="font-semibold mb-1">Resume data extracted successfully!</p>
          <p class="text-sm opacity-95">⚠️ Please review all extracted information carefully before saving. You can edit any field as needed.</p>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-white hover:text-amber-100">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    `;
    document.body.appendChild(warningDiv);
    
    // Auto-dismiss after 8 seconds
    setTimeout(() => {
      if (warningDiv.parentElement) {
        warningDiv.remove();
      }
    }, 8000);
    
    // Switch to personal info tab to see imported data
    setActiveTab('personal');
    
    // Mark that we have imported data (for warning banner)
    setHasImportedData(true);
  };

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error);
    // Error is already shown by ResumeUploadButton component
  };

  return (
    <MainLayout>
      {/* Top Header Bar - Fixed across all screen sizes */}
      <div className="bg-white border-b border-gray-200/80 shadow-sm sticky top-0 z-10">
        <div className="max-w-full px-4 lg:px-6 py-3.5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-lg lg:text-xl font-semibold text-gray-900 tracking-tight">
                {!id || id === 'new' ? 'Create New Resume' : 'Edit Resume'}
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Fill in your information and see the live preview
              </p>
            </div>
            <div className="flex gap-2">
              {isDirty && (
                <span className="text-xs text-amber-600 flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 rounded-lg border border-amber-200/50">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                  <span className="hidden sm:inline font-medium">Unsaved changes</span>
                </span>
              )}
              {(!id || id === 'new') && (
                <ResumeUploadButton 
                  onUploadSuccess={handleUploadSuccess}
                  onUploadError={handleUploadError}
                />
              )}
              {id && id !== 'new' && (
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  className="btn-outline flex items-center gap-1.5 text-sm px-3"
                  disabled={isDownloading}
                >
                  <Download size={16} />
                  <span className="hidden sm:inline">{isDownloading ? 'Downloading...' : 'Download'}</span>
                </button>
              )}
              <button
                type="submit"
                form="resume-form"
                className="btn-primary flex items-center gap-1.5 text-sm px-3.5"
                disabled={isLoading}
              >
                <Save size={16} />
                <span className="hidden sm:inline">{isLoading ? 'Saving...' : 'Save Resume'}</span>
                <span className="sm:hidden">Save</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - Two Column Layout on Desktop, Stacked on Mobile */}
      <div className="flex flex-col lg:flex-row">
        
        {/* LEFT SECTION: Editor (Scrollable Independently) */}
        <div className="w-full lg:w-1/2 bg-gray-50">
          <form 
            id="resume-form"
            onSubmit={handleSubmit(onSubmit, (validationErrors) => {
              console.error('❌ Form validation failed');
              console.error('Validation errors:', validationErrors);
              
              Object.entries(validationErrors).forEach(([field, error]) => {
                if (error && typeof error === 'object') {
                  if ('message' in error) {
                    console.error(`  ❌ ${field}: ${error.message}`);
                  } else {
                    Object.entries(error).forEach(([nestedField, nestedError]) => {
                      if (nestedError && typeof nestedError === 'object' && 'message' in nestedError) {
                        console.error(`  ❌ ${field}.${nestedField}: ${nestedError.message}`);
                      }
                    });
                  }
                }
              });
            })}
            className="h-auto lg:h-[calc(100vh-5rem)] overflow-y-auto hide-scrollbar"
          >
            <div className="px-4 lg:px-6 py-6 max-w-3xl mx-auto space-y-6">
              
              {/* Imported Data Warning Banner */}
              {hasImportedData && isDirty && (
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-lg shadow-sm">
                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-amber-800 mb-1">
                        Review Extracted Information
                      </h3>
                      <p className="text-sm text-amber-700">
                        Please carefully review all extracted data before saving. All fields are editable and you can make any necessary corrections.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setHasImportedData(false)}
                      className="text-amber-600 hover:text-amber-800 transition-colors"
                      aria-label="Dismiss warning"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              )}
              
              {/* Resume Title Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 p-5 lg:p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-4 tracking-tight">Resume Title</h2>
                
                {/* Validation Error Summary */}
                {Object.keys(errors).length > 0 && (
                  <div className="mb-4 p-3.5 bg-red-50 border border-red-200/60 rounded-xl">
                    <h3 className="text-sm font-medium text-red-800 mb-2 flex items-center gap-2">
                      <XCircle size={16} strokeWidth={2} />
                      Please fix the following errors:
                    </h3>
                    <ul className="text-xs text-red-700 list-disc list-inside space-y-1">
                      {errors.title && <li>{errors.title.message}</li>}
                      {errors.personalInfo?.firstName && <li>{errors.personalInfo.firstName.message}</li>}
                      {errors.personalInfo?.lastName && <li>{errors.personalInfo.lastName.message}</li>}
                      {errors.personalInfo?.email && <li>{errors.personalInfo.email.message}</li>}
                      {errors.personalInfo?.website && <li>Personal Info: {errors.personalInfo.website.message}</li>}
                      {errors.personalInfo?.linkedin && <li>Personal Info: {errors.personalInfo.linkedin.message}</li>}
                      {errors.personalInfo?.github && <li>Personal Info: {errors.personalInfo.github.message}</li>}
                      {errors.experience && <li>Check Experience section for errors</li>}
                      {errors.education && <li>Check Education section for errors</li>}
                      {errors.projects && <li>Check Projects section for errors</li>}
                      {errors.skills && <li>Check Skills section for errors</li>}
                    </ul>
                  </div>
                )}
                
                <input
                  type="text"
                  {...register('title')}
                  className="input"
                  placeholder="e.g., Software Engineer Resume"
                />
                {errors.title && (
                  <p className="mt-1 text-xs lg:text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              {/* Customization Panel - Moved to Left Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 p-5 lg:p-6">
                <h3 className="font-semibold text-gray-900 text-base mb-4 flex items-center gap-2 tracking-tight">
                  <Eye size={18} className="text-blue-600" strokeWidth={2} />
                  Customize Resume
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <TemplateSelector 
                    value={formData.templateSettings?.template || 'modern'}
                    onChange={handleTemplateChange}
                  />
                  <ColorThemeSelector 
                    value={formData.templateSettings?.colorTheme || 'blue'}
                    onChange={handleColorThemeChange}
                  />
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 overflow-hidden">
                <div className="border-b border-gray-100 bg-gray-50/50 px-4 lg:px-6 py-3">
                  <nav className="flex gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                          px-3 py-2 rounded-lg font-medium text-xs whitespace-nowrap relative transition-all
                          ${
                            activeTab === tab.id
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-200/60'
                          }
                        `}
                      >
                        {tab.label}
                        {/* Error indicator */}
                        {((tab.id === 'personal' && (errors.personalInfo || errors.title)) ||
                          (tab.id === 'experience' && errors.experience) ||
                          (tab.id === 'education' && errors.education) ||
                          (tab.id === 'projects' && errors.projects) ||
                          (tab.id === 'skills' && errors.skills)) && (
                          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                        )}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="p-5 lg:p-6">
                  {activeTab === 'personal' && (
                    <PersonalInfoSection register={register} errors={errors} />
                  )}
                  {activeTab === 'summary' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Professional Summary
                      </label>
                      <textarea
                        {...register('summary')}
                        rows={6}
                        className="textarea"
                        placeholder="Write a brief summary about yourself..."
                      />
                    </div>
                  )}
                  {activeTab === 'experience' && (
                    <ExperienceSection control={control} register={register} errors={errors} />
                  )}
                  {activeTab === 'education' && (
                    <EducationSection control={control} register={register} errors={errors} />
                  )}
                  {activeTab === 'projects' && (
                    <ProjectsSection control={control} register={register} setValue={setValue} errors={errors} />
                  )}
                  {activeTab === 'coursework' && (
                    <CourseworkSection control={control} register={register} errors={errors} />
                  )}
                  {activeTab === 'technical' && (
                    <TechnicalSkillsSection control={control} register={register} setValue={setValue} errors={errors} />
                  )}
                  {activeTab === 'skills' && (
                    <div className="space-y-6">
                      <SkillsSection control={control} register={register} setValue={setValue} />
                    </div>
                  )}
                  {activeTab === 'achievements' && (
                    <AchievementsSection control={control} register={register} setValue={setValue} errors={errors} />
                  )}
                  {activeTab === 'certifications' && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Certifications</h3>
                      <p className="text-sm text-gray-600">Add your professional certifications</p>
                      <CertificationsInput control={control} setValue={setValue} />
                    </div>
                  )}
                </div>
              </div>

            </div>
          </form>
        </div>

        {/* RIGHT SECTION: Resume Preview (Sticky/Fixed on Desktop, Full Height) */}
        <div className="w-full lg:w-1/2 lg:h-[calc(100vh-5rem)] lg:sticky lg:top-[5rem] bg-gray-100 border-l border-gray-200">
          <div className="h-full overflow-y-auto hide-scrollbar p-4 lg:p-6">
            <div className="flex justify-center items-start min-h-full">
              <div className="transform scale-[0.5] sm:scale-[0.6] lg:scale-[0.65] origin-top" style={{ width: '210mm', minWidth: '210mm' }}>
                <ResumePreview 
                  data={formData} 
                  templateSettings={formData.templateSettings}
                />
              </div>
            </div>
          </div>
        </div>

      </div>
    </MainLayout>
  );
}