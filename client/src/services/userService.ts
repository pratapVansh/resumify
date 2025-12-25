/**
 * User Service
 * Handles user profile API calls
 */

import api from './api';

interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profilePhoto?: string;
  avatar?: string;
  createdAt: string;
}

interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
}

/**
 * Get user profile
 */
export const getUserProfile = async (): Promise<UserProfile> => {
  const response = await api.get('/users/profile');
  return response.data.data.user;
};

/**
 * Update user profile
 */
export const updateUserProfile = async (data: UpdateProfileData): Promise<UserProfile> => {
  const response = await api.patch('/users/profile', data);
  return response.data.data.user;
};

/**
 * Upload profile photo
 */
export const uploadProfilePhoto = async (file: File): Promise<{ photoUrl: string; user: UserProfile }> => {
  const formData = new FormData();
  formData.append('photo', file);

  const response = await api.post('/users/profile/photo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.data;
};

/**
 * Delete profile photo
 */
export const deleteProfilePhoto = async (): Promise<void> => {
  await api.delete('/users/profile/photo');
};
