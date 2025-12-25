import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchResumes, deleteResume, duplicateResume } from '@/store/slices/resumeSlice';
import { formatDate } from '@/utils/helpers';
import { Plus, FileText, Copy, Trash2, Eye, EyeOff, ExternalLink, Download, Edit } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { FadeIn, SlideIn, StaggerChildren } from '@/components/common/Animations';
import { SkeletonCard } from '@/components/common/Skeleton';
import { downloadResumePDF, triggerDownload } from '@/services/uploadService';

export default function DashboardPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { resumes, isLoading } = useAppSelector((state) => state.resume);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchResumes());
  }, [dispatch]);

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
        {/* Header */}
        <FadeIn>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.firstName || 'there'}! 👋
            </h1>
            <p className="text-gray-600">Manage your resumes and create new ones</p>
          </div>
        </FadeIn>

        {/* Stats */}
        <StaggerChildren>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <SlideIn direction="up" delay={100}>
              <div className="card">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                    <FileText className="text-primary-600" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Resumes</p>
                    <p className="text-2xl font-bold text-gray-900">{resumes.length}</p>
                  </div>
                </div>
              </div>
            </SlideIn>

            <SlideIn direction="up" delay={200}>
              <div className="card">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <Eye className="text-green-600" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Public Resumes</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {resumes.filter((r) => r.visibility === 'public').length}
                    </p>
                  </div>
                </div>
              </div>
            </SlideIn>

            <SlideIn direction="up" delay={300}>
              <div className="card">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <EyeOff className="text-purple-600" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Private Resumes</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {resumes.filter((r) => r.visibility === 'private').length}
                    </p>
                  </div>
                </div>
              </div>
            </SlideIn>
          </div>
        </StaggerChildren>

        {/* Resumes list */}
        <FadeIn delay={400}>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Your Resumes</h2>
            <button onClick={handleCreateResume} className="btn-primary flex items-center gap-2">
              <Plus size={20} />
              Create New Resume
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {resumes.map((resume, index) => (
              <SlideIn key={resume._id} direction="up" delay={500 + (index * 50)}>
                <div className="group bg-white rounded-lg border border-gray-200 hover:shadow-xl transition-all duration-200 overflow-hidden">
                  {/* Thumbnail Preview */}
                  <div 
                    className="relative bg-gray-100 aspect-[3/4] cursor-pointer overflow-hidden"
                    onClick={() => handleViewPDF(resume)}
                  >
                    {/* Use previewUrl with fallback to thumbnailUrl */}
                    {(resume.previewUrl || resume.thumbnailUrl) ? (
                      <img
                        src={resume.previewUrl || resume.thumbnailUrl}
                        alt={resume.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          // Fallback to placeholder if preview fails to load
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    {/* Fallback Icon */}
                    <div className={`${(resume.previewUrl || resume.thumbnailUrl) ? 'hidden' : ''} absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100`}>
                      <FileText className="text-blue-500" size={64} strokeWidth={1.5} />
                    </div>
                    
                    {/* Visibility Badge */}
                    <div className="absolute top-2 right-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full backdrop-blur-sm ${
                          resume.visibility === 'public'
                            ? 'bg-green-500/90 text-white'
                            : 'bg-gray-700/90 text-white'
                        }`}
                      >
                        {resume.visibility === 'public' ? (
                          <span className="flex items-center gap-1">
                            <Eye size={12} />
                            Public
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <EyeOff size={12} />
                            Private
                          </span>
                        )}
                      </span>
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="text-white font-medium text-sm bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                        Click to view PDF
                      </span>
                    </div>
                  </div>

                  {/* Resume Info */}
                  <div className="p-4">
                    <h3 
                      className="font-semibold text-gray-900 truncate mb-1 cursor-pointer hover:text-primary-600"
                      onClick={() => handleEditResume(resume._id)}
                      title={resume.title}
                    >
                      {resume.title}
                    </h3>
                    <p className="text-xs text-gray-500 mb-3">
                      Updated {formatDate(resume.updatedAt)}
                    </p>

                    {/* Quick Stats */}
                    <div className="flex flex-wrap gap-1 mb-3 text-xs text-gray-600">
                      {resume.experience.length > 0 && (
                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                          {resume.experience.length} exp
                        </span>
                      )}
                      {resume.education.length > 0 && (
                        <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded">
                          {resume.education.length} edu
                        </span>
                      )}
                      {resume.projects.length > 0 && (
                        <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded">
                          {resume.projects.length} proj
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditResume(resume._id)}
                        className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 rounded transition-colors"
                        title="Edit Resume"
                      >
                        <Edit size={14} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDownloadPDF(resume._id, resume.title)}
                        className="flex items-center justify-center p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                        title="Download PDF"
                      >
                        <Download size={16} />
                      </button>
                      <button
                        onClick={() => handleDuplicateResume(resume._id)}
                        className="flex items-center justify-center p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                        title="Duplicate"
                      >
                        <Copy size={16} />
                      </button>
                      {resume.visibility === 'public' && (
                        <button
                          onClick={() => handleViewPublic(resume.shareId)}
                          className="flex items-center justify-center p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                          title="View Public Link"
                        >
                          <ExternalLink size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteResume(resume._id)}
                        className="flex items-center justify-center p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
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
