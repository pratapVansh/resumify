import { useState, useRef } from 'react';
import { Upload, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { resumeService } from '@/services/resumeService';

interface ResumeUploadButtonProps {
  onUploadSuccess?: (parsedData: any) => void;
  onUploadError?: (error: string) => void;
}

export default function ResumeUploadButton({ onUploadSuccess, onUploadError }: ResumeUploadButtonProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      const errorMsg = 'Invalid file type. Please upload a PDF or DOCX file.';
      setUploadStatus('error');
      setStatusMessage(errorMsg);
      onUploadError?.(errorMsg);
      setTimeout(() => setUploadStatus('idle'), 3000);
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      const errorMsg = 'File size exceeds 10MB limit.';
      setUploadStatus('error');
      setStatusMessage(errorMsg);
      onUploadError?.(errorMsg);
      setTimeout(() => setUploadStatus('idle'), 3000);
      return;
    }

    setIsUploading(true);
    setUploadStatus('idle');
    setStatusMessage('');

    try {
      console.log('📤 Uploading resume:', file.name);
      const result = await resumeService.parseResume(file);
      
      console.log('✅ Resume parsed successfully:', result);
      setUploadStatus('success');
      setStatusMessage('Resume parsed successfully!');
      
      onUploadSuccess?.(result.parsedData);
      
      setTimeout(() => setUploadStatus('idle'), 3000);
    } catch (error: any) {
      console.error('❌ Resume upload failed:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to parse resume';
      setUploadStatus('error');
      setStatusMessage(errorMsg);
      onUploadError?.(errorMsg);
      
      setTimeout(() => setUploadStatus('idle'), 3000);
    } finally {
      setIsUploading(false);
      // Reset input so same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex items-center gap-3">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />
      
      <button
        type="button"
        onClick={handleButtonClick}
        disabled={isUploading}
        className={`
          btn-outline flex items-center gap-2 transition-all
          ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-50'}
        `}
      >
        {isUploading ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            <span className="hidden sm:inline">Parsing...</span>
          </>
        ) : (
          <>
            <Upload size={20} />
            <span className="hidden sm:inline">Upload Existing Resume</span>
            <span className="sm:hidden">Upload</span>
          </>
        )}
      </button>

      {/* Status Messages */}
      {uploadStatus === 'success' && (
        <div className="flex items-center gap-2 text-green-600 text-sm animate-fade-in">
          <CheckCircle size={18} />
          <span className="hidden lg:inline">{statusMessage}</span>
        </div>
      )}
      
      {uploadStatus === 'error' && (
        <div className="flex items-center gap-2 text-red-600 text-sm animate-fade-in">
          <XCircle size={18} />
          <span className="hidden lg:inline">{statusMessage}</span>
        </div>
      )}
    </div>
  );
}
