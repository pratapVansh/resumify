import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createResume, updateResume, fetchResume } from '@/store/slices/resumeSlice';
import { resumeSchema } from '@/schemas/resumeSchema';
import { ResumeFormData } from '@/types';
import MainLayout from '@/components/layout/MainLayout';
import PersonalInfoSection from '@/components/resume/PersonalInfoSection';
import ExperienceSection from '@/components/resume/ExperienceSection';
import EducationSection from '@/components/resume/EducationSection';
import ProjectsSection from '@/components/resume/ProjectsSection';
import SkillsSection from '@/components/resume/SkillsSection';
import ResumePreview from '@/components/resume/ResumePreview';
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
      skills: [],
      languages: [],
      certifications: [],
      visibility: 'private',
      templateSettings: {
        template: 'modern',
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
    if (currentResume && id && id !== 'new') {
      console.log('📋 Loading resume data into form:', currentResume);
      reset(currentResume);
    }
  }, [currentResume, reset, id]);

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
    };

    console.log('🧹 Cleaned resume data:', cleanedData);
    
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
          setTimeout(() => successDiv.remove(), 3000);
          // Reset the form with the updated data to clear isDirty state
          reset(result.payload);
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
    { id: 'skills', label: 'Skills & Others' },
  ];

  const handleDownloadPDF = async () => {
    if (!id || id === 'new') {
      alert('Please save the resume first before downloading PDF');
      return;
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

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        {/* Form wrapper - handles validation and submission */}
        <form onSubmit={handleSubmit(onSubmit, (validationErrors) => {
          console.error('❌ Form validation failed');
          console.error('Validation errors:', validationErrors);
          
          // Log each field error clearly
          Object.entries(validationErrors).forEach(([field, error]) => {
            if (error && typeof error === 'object') {
              // Handle nested errors like personalInfo.firstName
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
        })} className="flex-1 flex flex-col overflow-hidden">
        <div className="mb-6 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {!id || id === 'new' ? 'Create New Resume' : 'Edit Resume'}
            </h1>
            <p className="text-gray-600 mt-1">
              Fill in your information and see the live preview
            </p>
          </div>
          <div className="flex gap-3">
            {isDirty && (
              <span className="text-sm text-amber-600 flex items-center gap-1 mr-2">
                <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                Unsaved changes
              </span>
            )}
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="btn-outline lg:hidden"
            >
              {showPreview ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            {/* Download PDF button - only show if editing existing resume */}
            {id && id !== 'new' && (
              <button
                type="button"
                onClick={handleDownloadPDF}
                className="btn-outline flex items-center gap-2"
                disabled={isDownloading}
              >
                <Download size={20} />
                {isDownloading ? 'Downloading...' : 'PDF'}
              </button>
            )}
            {/* Submit button - type="submit" triggers form validation and onSubmit handler */}
            <button
              type="submit"
              className="btn-primary flex items-center gap-2"
              disabled={isLoading}
            >
              <Save size={20} />
              {isLoading ? 'Saving...' : 'Save Resume'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-hidden">
          {/* Editor Section */}
          <div className={`${showPreview ? 'hidden lg:block' : ''} flex flex-col overflow-hidden`}>
            <div className="card flex-1 flex flex-col overflow-hidden">
              {/* Resume Title */}
              <div className="mb-6 flex-shrink-0">
                {/* Validation Error Summary */}
                {Object.keys(errors).length > 0 && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h3 className="text-sm font-semibold text-red-800 mb-2">
                      Please fix the following errors:
                    </h3>
                    <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
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
                
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resume Title
                </label>
                <input
                  type="text"
                  {...register('title')}
                  className="input"
                  placeholder="e.g., Software Engineer Resume"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 mb-6 flex-shrink-0">
                <nav className="flex gap-4 overflow-x-auto">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        pb-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap relative
                        ${
                          activeTab === tab.id
                            ? 'border-primary-600 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
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
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto">
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
                {activeTab === 'skills' && (
                  <SkillsSection control={control} register={register} setValue={setValue} />
                )}
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div className={`${!showPreview ? 'hidden lg:block' : ''} overflow-y-auto`}>
            <div className="sticky top-0">
              <ResumePreview data={formData} />
            </div>
          </div>
        </div>
        </form>
      </div>
    </MainLayout>
  );
}
      