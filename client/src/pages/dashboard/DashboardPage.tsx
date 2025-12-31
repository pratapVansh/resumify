import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchResumes, deleteResume, duplicateResume } from '@/store/slices/resumeSlice';
import { formatDate } from '@/utils/helpers';
import { Plus, FileText, Copy, Trash2, Eye, EyeOff, ExternalLink, Download, Edit, User } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { FadeIn, SlideIn, StaggerChildren } from '@/components/common/Animations';
import { SkeletonCard } from '@/components/common/Skeleton';
import { downloadResumePDF, triggerDownload } from '@/services/uploadService';
import ProfilePhotoUpload from '@/components/profile/ProfilePhotoUpload';
import { getUserProfile } from '@/services/userService';

export default function DashboardPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { resumes, isLoading } = useAppSelector((state) => state.resume);
  const { user } = useAppSelector((state) => state.auth);
  const [profilePhoto, setProfilePhoto] = useState<string | undefined>();
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    dispatch(fetchResumes());
    loadUserProfile();
  }, [dispatch]);

  const loadUserProfile = async () => {
    try {
      const profile = await getUserProfile();
      setProfilePhoto(profile.profilePhoto);
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const handlePhotoUpdate = (newPhotoUrl: string) => {
    setProfilePhoto(newPhotoUrl);
  };

  const handleCreateResume = () => {
    navigate('/resumes/new');
  };

  const handleEditResume = (id: string) => {
    navigate(`/resumes/${id}/edit`);
  };

  const handleDuplicateResume = async (id: string) => {
    const result = await dispatch(duplicateResume(id));
    if (duplicateResume.fulfilled.match(result)) {
      navigate(`/resumes/${result.payload._id}/edit`);
    }
  };

  const handleDeleteResume = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this resume?')) {
      await dispatch(deleteResume(id));
    }
  };

  const handleViewPublic = (shareId: string) => {
    window.open(`/r/${shareId}`, '_blank');
  };

  const handleViewPDF = (resume: Resume) => {
    // Use viewPdfUrl for inline viewing, fallback to pdfUrl for download
    const viewUrl = resume.viewPdfUrl || resume.pdfUrl;
    
    if (viewUrl) {
      console.log('👁️ Opening PDF for viewing:', viewUrl);
      window.open(viewUrl, '_blank');
    } else {
      console.warn('⚠️ PDF URL not available yet');
      alert('PDF is being generated. Please try again in a moment.');
    }
  };

  const handleDownloadPDF = async (resumeId: string, resumeTitle: string) => {
    try {
      const blob = await downloadResumePDF(resumeId);
      const filename = `${resumeTitle.replace(/\s+/g, '_')}.pdf`;
      triggerDownload(blob, filename);
    } catch (error: any) {
      console.error('Failed to download PDF:', error);
      alert(error.response?.data?.message || 'Failed to download PDF. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="h-8 w-64 bg-gray-200 rounded mb-2 animate-pulse"></div>
            <div className="h-5 w-96 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header with Profile Section */}
        <FadeIn>
          <div className="mb-6 flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-1.5 tracking-tight">
                Welcome back, {user?.firstName || 'there'}!
              </h1>
              <p className="text-sm text-gray-500">Manage your resumes and create new ones</p>
            </div>
            
            {/* Profile Section Toggle */}
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all text-sm font-medium text-gray-700 shadow-sm"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </button>
          </div>
        </FadeIn>

        {/* Profile Photo Upload Section */}
        {showProfile && (
          <FadeIn>
            <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200/60 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 tracking-tight">Profile Settings</h2>
              <div className="flex flex-col items-center">
                <ProfilePhotoUpload
                  currentPhotoUrl={profilePhoto}
                  userName={`${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.email || 'User'}
                  onPhotoUpdate={handlePhotoUpdate}
                />
              </div>
            </div>
          </FadeIn>
        )}

        {/* Stats */}
        <StaggerChildren>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <SlideIn direction="up" delay={100}>
              <div className="card hover:shadow-md">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
                    <FileText className="text-blue-600" size={20} strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Resumes</p>
                    <p className="text-2xl font-semibold text-gray-900 mt-0.5">{resumes.length}</p>
                  </div>
                </div>
              </div>
            </SlideIn>


          </div>
        </StaggerChildren>

        {/* Resumes list */}
        <FadeIn delay={400}>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 tracking-tight">Your Resumes</h2>
            <button onClick={handleCreateResume} className="btn-primary flex items-center gap-2">
              <Plus size={18} strokeWidth={2} />
              <span className="hidden sm:inline">Create New</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>
        </FadeIn>

        {resumes.length === 0 ? (
          <SlideIn direction="up" delay={500}>
            <div className="card text-center py-12">
              <FileText className="mx-auto mb-4 text-gray-400" size={48} />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No resumes yet</h3>
              <p className="text-gray-600 mb-6">Create your first resume to get started</p>
              <button onClick={handleCreateResume} className="btn-primary inline-flex items-center gap-2">
                <Plus size={20} />
                Create Your First Resume
              </button>
            </div>
          </SlideIn>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {resumes.map((resume, index) => (
              <SlideIn key={resume._id} direction="up" delay={500 + (index * 50)}>
                <div className="group bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-lg shadow-sm transition-all duration-200 overflow-hidden">
                  {/* Thumbnail Preview */}
                  <div 
                    className="relative bg-gray-50 aspect-[1.414/1] cursor-pointer overflow-hidden"
                    onClick={() => handleViewPDF(resume)}
                  >
                    {/* Use previewUrl with fallback to thumbnailUrl */}
                    {(resume.previewUrl || resume.thumbnailUrl) ? (
                      <img
                        src={resume.previewUrl || resume.thumbnailUrl}
                        alt={resume.title}
                        className="w-full h-full object-cover object-top group-hover:scale-[1.02] transition-transform duration-300"
                        onError={(e) => {
                          // Fallback to placeholder if preview fails to load
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    {/* Fallback Icon */}
                    <div className={`${(resume.previewUrl || resume.thumbnailUrl) ? 'hidden' : ''} absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100`}>
                      <FileText className="text-gray-400" size={48} strokeWidth={1.5} />
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="text-white font-medium text-xs bg-blue-600/90 px-3 py-1.5 rounded-md shadow-sm">
                        View PDF
                      </span>
                    </div>
                  </div>

                  {/* Resume Info */}
                  <div className="p-3">
                    <h3 
                      className="font-medium text-sm text-gray-900 truncate mb-1 cursor-pointer hover:text-blue-600 transition-colors"
                      onClick={() => handleEditResume(resume._id)}
                      title={resume.title}
                    >
                      {resume.title}
                    </h3>
                    <p className="text-xs text-gray-500 mb-2">
                      Updated {formatDate(resume.updatedAt)}
                    </p>

                    {/* Quick Stats */}
                    <div className="hidden flex-wrap gap-1 mb-2 text-xs text-gray-600">
                      {resume.experience.length > 0 && (
                        <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-[10px] font-medium">
                          {resume.experience.length} exp
                        </span>
                      )}
                      {resume.education.length > 0 && (
                        <span className="bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded text-[10px] font-medium">
                          {resume.education.length} edu
                        </span>
                      )}
                      {resume.projects.length > 0 && (
                        <span className="bg-green-50 text-green-600 px-1.5 py-0.5 rounded text-[10px] font-medium">
                          {resume.projects.length} proj
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-0.5">
                      <button
                        onClick={() => handleEditResume(resume._id)}
                        className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                        title="Edit Resume"
                      >
                        <Edit size={13} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDownloadPDF(resume._id, resume.title)}
                        className="flex items-center justify-center p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                        title="Download PDF"
                      >
                        <Download size={15} />
                      </button>
                      <button
                        onClick={() => handleDuplicateResume(resume._id)}
                        className="flex items-center justify-center p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                        title="Duplicate"
                      >
                        <Copy size={15} />
                      </button>
                      <button
                        onClick={() => handleDeleteResume(resume._id)}
                        className="flex items-center justify-center p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </SlideIn>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
