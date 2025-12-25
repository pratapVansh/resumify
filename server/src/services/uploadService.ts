import cloudinary from '../config/cloudinary.js';
import { AppError } from '../utils/AppError.js';

interface UploadResult {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  format: string;
  resourceType: string;
}

/**
 * Upload Buffer to Cloudinary using Base64 Data URI (NO STREAMS)
 * - Correct MIME handling
 * - Reliable for PDFs and Images
 */
const uploadBufferBase64 = async (
  fileBuffer: Buffer,
  folder: string,
  options: {
    resourceType?: 'image' | 'raw' | 'video' | 'auto';
    publicId?: string;
    format?: string;
    transformation?: any;
  }
): Promise<UploadResult> => {
  try {
    const base64 = fileBuffer.toString('base64');
    const dataUri = `data:application/pdf;base64,${base64}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: `resumify/${folder}`,
      resource_type: options.resourceType || 'auto',
      public_id: options.publicId,
      format: options.format,
      transformation: options.transformation,
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      resourceType: result.resource_type,
    };
  } catch (error) {
    console.error('❌ Cloudinary upload error:', error);
    throw new AppError('Failed to upload file to Cloudinary', 500);
  }
};

/**
 * Upload profile photo with image optimization
 */
export const uploadProfilePhoto = async (
  fileBuffer: Buffer,
  userId: string,
  mimeType: string
): Promise<UploadResult> => {
  return uploadBufferBase64(fileBuffer, 'profile-photos', {
    resourceType: 'image',
    publicId: `user-${userId}-${Date.now()}`,
    mimeType, // 🔥 image/jpeg, image/png, etc.
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
 * CRITICAL: Upload as 'image' type, NOT 'raw'
 * - Enables PDF page transformations (JPG preview)
 * - Enables inline viewing in browser
 * - Still allows download
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

  // Upload PDF as IMAGE type (enables transformations)
  const uploadResult = await uploadBufferBase64(fileBuffer, folder, {
    resourceType: 'image',  // MUST be 'image' for PDF transformations
    publicId,
  });

  console.log('✅ PDF uploaded:', uploadResult.url);

  // Generate JPG preview from page 1
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

  // Use secure_url for inline viewing
  const viewPdfUrl = uploadResult.url;

  console.log('👁️ View URL:', viewPdfUrl);

  return {
    url: uploadResult.url,      // Download/view URL
    publicId: uploadResult.publicId,
    previewUrl,                 // JPG preview of page 1
    viewPdfUrl,                 // PDF inline view
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
