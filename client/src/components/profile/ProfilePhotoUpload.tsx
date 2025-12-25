/**
 * Profile Photo Upload Component
 * Allows users to upload, preview, and delete their profile photo
 */

import React, { useState, useRef } from 'react';
import { Camera, Trash2, Upload } from 'lucide-react';
import { uploadProfilePhoto, deleteProfilePhoto } from '../../services/userService';
import LoadingSpinner from '../common/LoadingSpinner';

interface ProfilePhotoUploadProps {
  currentPhotoUrl?: string;
  userName?: string;
  onPhotoUpdate?: (photoUrl: string) => void;
}

const ProfilePhotoUpload: React.FC<ProfilePhotoUploadProps> = ({
  currentPhotoUrl,
  userName = 'User',
  onPhotoUpdate,
}) => {
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(currentPhotoUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setError(null);

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError(null);

    try {
      const { photoUrl: newPhotoUrl } = await uploadProfilePhoto(file);
      setPhotoUrl(newPhotoUrl);
      setPreviewUrl(null);
      onPhotoUpdate?.(newPhotoUrl);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload photo');
      setPreviewUrl(null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your profile photo?')) {
      return;
    }

    setUploading(true);
    setError(null);

    try {
      await deleteProfilePhoto();
      setPhotoUrl(undefined);
      setPreviewUrl(null);
      onPhotoUpdate?.('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete photo');
    } finally {
      setUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const getInitials = () => {
    return userName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const displayUrl = previewUrl || photoUrl;

  return (
    <div className="profile-photo-upload">
      <div className="flex flex-col items-center gap-4">
        {/* Photo Display */}
        <div className="relative">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            {displayUrl ? (
              <img
                src={displayUrl}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white text-4xl font-bold">{getInitials()}</span>
            )}
          </div>

          {/* Upload Button Overlay */}
          <button
            onClick={triggerFileInput}
            disabled={uploading}
            className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title="Upload photo"
          >
            {uploading ? (
              <div className="w-5 h-5">
                <LoadingSpinner />
              </div>
            ) : (
              <Camera className="w-5 h-5" />
            )}
          </button>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={triggerFileInput}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            <Upload className="w-4 h-4" />
            {photoUrl ? 'Change Photo' : 'Upload Photo'}
          </button>

          {photoUrl && !previewUrl && (
            <button
              onClick={handleDelete}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-red-600 text-sm bg-red-50 px-4 py-2 rounded-lg">
            {error}
          </div>
        )}

        {/* Upload Info */}
        <div className="text-gray-500 text-xs text-center">
          <p>JPG, PNG, or WEBP. Max 5MB.</p>
          <p>Recommended: 400x400px</p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePhotoUpload;
