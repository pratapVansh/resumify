import cloudinary from '../config/cloudinary.js';
import { AppError } from '../utils/AppError.js';
import { Readable } from 'stream';

interface UploadResult {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  format: string;
  resourceType: string;
}

interface UploadOptions {
  resourceType?: 'image' | 'raw' | 'video' | 'auto';
  publicId?: string;
  format?: string;
  transformation?: any;
}

/**
 * Upload Buffer to Cloudinary using upload_stream
 * - Converts Buffer to Readable stream
 * - Pipes to Cloudinary upload_stream
 * - Returns Promise with upload result
 */
const uploadBufferStream = async (
  fileBuffer: Buffer,
  folder: string,
  options: UploadOptions
): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `resumify/${folder}`,
        resource_type: options.resourceType || 'auto',
        public_id: options.publicId,
        format: options.format,
        transformation: options.transformation,
      },
      (error, result) => {
        if (error) {
          console.error('❌ Cloudinary upload_stream error:', error);
          reject(new AppError('Failed to upload file to Cloudinary', 500));
        } else if (result) {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            resourceType: result.resource_type,
          });
        } else {
          reject(new AppError('Upload failed: No result returned', 500));
        }
      }
    );

    // Convert buffer to readable stream and pipe to Cloudinary
    const bufferStream = Readable.from(fileBuffer);
    bufferStream.pipe(uploadStream);
  });
};

/**
 * Upload profile photo with image optimization
 */
export const uploadProfilePhoto = async (
  fileBuffer: Buffer,
  userId: string
): Promise<UploadResult> => {
  return uploadBufferStream(fileBuffer, 'profile-photos', {
    resourceType: 'image',
    publicId: `user-${userId}-${Date.now()}`,
    transformation: {
      width: 400,
      height: 400,
      crop: 'fill',
      gravity: 'face',
      quality: 'auto:good',
      fetch_format: 'auto',
    },
  });
};

/**
 * Upload resume PDF with preview + inline viewing
 * 
 * CRITICAL: Upload as 'image' type with format: 'pdf'
 * - resource_type: "image" enables PDF page transformations
 * - format: "pdf" explicitly sets the file format
 * - Enables JPG preview generation from page 1
 * - Enables inline viewing in browser
 */
export const uploadResumeFile = async (
  fileBuffer: Buffer,
  resumeId: string,
  userId?: string
): Promise<{
  url: string;
  publicId: string;
  previewUrl: string;
  viewPdfUrl: string;
}> => {
  const folder = userId ? `resumes/${userId}` : 'resume-files';
  const publicId = `resume-${resumeId}-${Date.now()}`;

  console.log('📁 Uploading PDF to folder:', folder);
  console.log('📄 Public ID:', publicId);

  // Upload PDF using upload_stream
  // - resource_type: "image" for PDF transformations
  // - format: "pdf" to explicitly set format
  const uploadResult = await uploadBufferStream(fileBuffer, folder, {
    resourceType: 'image',
    format: 'pdf',
    publicId,
  });

  console.log('✅ PDF uploaded:', uploadResult.url);

  // Generate JPG preview from page 1 using Cloudinary transformations
  const previewUrl = cloudinary.url(uploadResult.publicId, {
    resource_type: 'image',
    format: 'jpg',
    page: 1,
    width: 300,
    height: 420,
    crop: 'fill',
    quality: 'auto',
  });

  console.log('🖼️ Preview URL:', previewUrl);

  // secure_url for inline PDF viewing
  const viewPdfUrl = uploadResult.url;

  console.log('👁️ View URL:', viewPdfUrl);

  return {
    url: uploadResult.url,
    publicId: uploadResult.publicId,
    previewUrl,
    viewPdfUrl,
  };
};

/**
 * Delete file from Cloudinary
 */
export const deleteFromCloudinary = async (
  publicId: string,
  resourceType: 'image' | 'raw' | 'video' = 'image'
): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new AppError('Failed to delete file from Cloudinary', 500);
  }
};

/**
 * Validate image file type
 */
export const isValidImageType = (mimetype: string): boolean => {
  const validTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
  ];
  return validTypes.includes(mimetype);
};

/**
 * Validate file size (in bytes)
 */
export const isValidFileSize = (size: number, maxSizeMB: number = 5): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return size <= maxSizeBytes;
};
