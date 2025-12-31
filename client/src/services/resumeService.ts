import api from './api';
import { Resume, ResumeFormData, ApiResponse } from '@/types';

export const resumeService = {
  // Get all resumes
  async getResumes(): Promise<Resume[]> {
    const response = await api.get<ApiResponse<{ resumes: Resume[] }>>('/resumes');
    return response.data.data?.resumes || [];
  },

  // Get single resume
  async getResume(id: string): Promise<Resume> {
    const response = await api.get<ApiResponse<{ resume: Resume }>>(`/resumes/${id}`);
    return response.data.data!.resume;
  },

  // Create resume
  async createResume(data: ResumeFormData): Promise<Resume> {
    const response = await api.post<ApiResponse<{ resume: Resume }>>('/resumes', data);
    return response.data.data!.resume;
  },

  // Update resume
  async updateResume(id: string, data: Partial<ResumeFormData>): Promise<Resume> {
    const response = await api.put<ApiResponse<{ resume: Resume }>>(`/resumes/${id}`, data);
    return response.data.data!.resume;
  },

  // Delete resume
  async deleteResume(id: string): Promise<void> {
    await api.delete(`/resumes/${id}`);
  },

  // Toggle visibility
  async toggleVisibility(id: string): Promise<Resume> {
    const response = await api.patch<ApiResponse<{ resume: Resume }>>(`/resumes/${id}/visibility`);
    return response.data.data!.resume;
  },

  // Duplicate resume
  async duplicateResume(id: string): Promise<Resume> {
    const response = await api.post<ApiResponse<{ resume: Resume }>>(`/resumes/${id}/duplicate`);
    return response.data.data!.resume;
  },

  // Get public resume
  async getPublicResume(shareId: string): Promise<Resume> {
    const response = await api.get<ApiResponse<{ resume: Resume }>>(`/resumes/public/${shareId}`);
    return response.data.data!.resume;
  },

  // Parse uploaded resume file
  async parseResume(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<ApiResponse<any>>('/resumes/parse', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },
};

// Standalone function for public resume access
export const getPublicResume = async (shareId: string) => {
  return await resumeService.getPublicResume(shareId);
};
