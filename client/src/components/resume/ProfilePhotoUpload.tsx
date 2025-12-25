import React, { useState, useRef } from 'react';
import { Camera, X, Loader2 } from 'lucide-react';
import { uploadProfilePhoto, deleteFile } from '../../services/uploadService';

interface ProfilePhotoUploadProps {
  currentPhotoUrl?: string;
  currentPhotoPublicId?: string;
  onPhotoUpdate: (url: string, publicId: string) => void;
  className?: string;
}

const ProfilePhotoUpload: React.FC<ProfilePhotoUploadProps> = ({
  currentPhotoUrl,
  currentPhotoPublicId,
  onPhotoUpdate,
  className = '',
}) => {
  const [photoUrl, setPhotoUrl] = useState<string>(currentPhotoUrl || '');
  const [photoPublicId, setPhotoPublicId] = useState<string>(currentPhotoPublicId || '');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setError('');
    setIsUploading(true);

    try {
      const response = await uploadProfilePhoto(file);
      const { url, publicId } = response.data;

      // Delete old photo if exists
      if (photoPublicId) {
        try {
          await deleteFile(photoPublicId, 'image');
        } catch (err) {
          console.error('Error deleting old photo:', err);
        }
      }

      setPhotoUrl(url);
      setPhotoPublicId(publicId);
      onPhotoUpdate(url, publicId);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload photo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!photoPublicId) return;

    setIsUploading(true);
    try {
      await deleteFile(photoPublicId, 'image');
      setPhotoUrl('');
      setPhotoPublicId('');
      onPhotoUpdate('', '');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete photo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative">
        {/* Photo Display */}
        <div
          className={`
            w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200
            flex items-center justify-center cursor-pointer
            ${isUploading ? 'opacity-50' : 'hover:border-blue-500'}
            transition-all duration-200
          `}
          onClick={!isUploading ? handleClick : undefined}
        >
          {photoUrl ? (
            <img
              src={photoUrl}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <Camera className="w-12 h-12 text-gray-400" />
            </div>
          )}
        </div>

        {/* Loading Overlay */}
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-full">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        )}

        {/* Remove Button */}
        {photoUrl && !isUploading && (
          <button
            onClick={handleRemovePhoto}
            className="
              absolute -top-2 -right-2 w-8 h-8 rounded-full
              bg-red-500 text-white flex items-center justify-center
              hover:bg-red-600 transition-colors shadow-lg
            "
            title="Remove photo"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Upload Button */}
        {!photoUrl && !isUploading && (
          <button
            onClick={handleClick}
            className="
              absolute -bottom-2 -right-2 w-10 h-10 rounded-full
              bg-blue-600 text-white flex items-center justify-center
              hover:bg-blue-700 transition-colors shadow-lg
            "
            title="Upload photo"
          >
            <Camera className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Instructions */}
      <p className="mt-3 text-sm text-gray-600 text-center">
        {photoUrl ? 'Click to change photo' : 'Click to upload photo'}
      </p>
      <p className="text-xs text-gray-500 text-center">
        Max size: 5MB • JPG, PNG, WebP, GIF
      </p>

      {/* Error Message */}
      {error && (
        <div className="mt-2 text-sm text-red-600 text-center">{error}</div>
      )}
    </div>
  );
};

export default ProfilePhotoUpload;
