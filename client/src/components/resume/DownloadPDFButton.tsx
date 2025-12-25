import React, { useState } from 'react';
import { Download, Loader2, FileText, Eye } from 'lucide-react';
import {
  downloadResumePDF,
  previewResumePDF,
  triggerDownload,
} from '../../services/uploadService';

interface DownloadPDFButtonProps {
  resumeId: string;
  resumeName: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  showPreview?: boolean;
  className?: string;
}

const DownloadPDFButton: React.FC<DownloadPDFButtonProps> = ({
  resumeId,
  resumeName,
  variant = 'primary',
  size = 'md',
  showPreview = true,
  className = '',
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [error, setError] = useState<string>('');

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    setError('');

    try {
      const blob = await downloadResumePDF(resumeId);
      const filename = `${resumeName.replace(/\s+/g, '_')}.pdf`;
      triggerDownload(blob, filename);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to download PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePreview = async () => {
    setIsPreviewing(true);
    setError('');

    try {
      const blob = await previewResumePDF(resumeId);
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      // Clean up after a delay
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to preview PDF');
    } finally {
      setIsPreviewing(false);
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex gap-2">
        {/* Download Button */}
        <button
          onClick={handleDownload}
          disabled={isDownloading || isPreviewing}
          className={`
            ${variantClasses[variant]}
            ${sizeClasses[size]}
            rounded-lg font-medium
            disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center gap-2
            transition-all duration-200
            shadow-md hover:shadow-lg
          `}
        >
          {isDownloading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Downloading...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Download PDF
            </>
          )}
        </button>

        {/* Preview Button */}
        {showPreview && (
          <button
            onClick={handlePreview}
            disabled={isDownloading || isPreviewing}
            className={`
              ${variantClasses.outline}
              ${sizeClasses[size]}
              rounded-lg font-medium
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center gap-2
              transition-all duration-200
              shadow-md hover:shadow-lg
            `}
          >
            {isPreviewing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                Preview
              </>
            )}
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">
          <FileText className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
};

export default DownloadPDFButton;
