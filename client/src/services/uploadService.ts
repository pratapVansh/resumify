import api from './api';
import axios from 'axios';

interface UploadResponse {
  status: string;
  data: {
    url: string;
    publicId: string;
    width?: number;
    height?: number;
    format?: string;
  };
}

/**
 * Upload profile photo
 */
export const uploadProfilePhoto = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('photo', file);

  const response = await api.post('/upload/profile-photo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

/**
 * Upload resume file
 */
export const uploadResumeFile = async (
  resumeId: string,
  file: File
): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post(`/upload/resume-file/${resumeId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

/**
 * Delete file from Cloudinary
 */
export const deleteFile = async (
  publicId: string,
  resourceType: 'image' | 'raw' | 'video' = 'image'
): Promise<void> => {
  await api.delete(`/upload/${encodeURIComponent(publicId)}`, {
    params: { resourceType },
  });
};

/**
 * Download resume as PDF
 */
export const downloadResumePDF = async (resumeId: string): Promise<Blob> => {
  const response = await api.get(`/pdf/resume/${resumeId}/download`, {
    responseType: 'blob',
  });

  return response.data;
};

/**
 * Preview resume PDF
 */
export const previewResumePDF = async (resumeId: string): Promise<Blob> => {
  const response = await api.get(`/pdf/resume/${resumeId}/preview`, {
    responseType: 'blob',
  });

  return response.data;
};

/**
 * Generate and upload PDF to Cloudinary
 */
export const generateAndUploadPDF = async (
  resumeId: string
): Promise<UploadResponse> => {
  const response = await api.post(`/pdf/resume/${resumeId}/upload`);
  return response.data;
};

/**
 * Download public resume by share ID
 */
export const downloadPublicResume = async (shareId: string): Promise<Blob> => {
  const response = await api.get(`/pdf/resume/share/${shareId}`, {
    responseType: 'blob',
  });

  return response.data;
};

/**
 * Helper to trigger file download in browser
 */
export const triggerDownload = (blob: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
