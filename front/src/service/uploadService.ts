import { AxiosError } from 'axios';
import apiClient from './apiClient';
import { ApiResponse } from '@/types/common';

interface UploadResponse {
  imageUrl: string;
}

export const uploadService = {
  async uploadProfileImage(file: File): Promise<ApiResponse<string>> {
    const formData = new FormData();
    formData.append('profileImage', file);

    try {
      const response = await apiClient.post<UploadResponse>('/upload/profile-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return { data: response.data.imageUrl, error: null };
    } catch (error: unknown) {
      const e = error as AxiosError<{ message?: string }>;
      const errorMessage = e.response?.data?.message || e.message || 'Ocurrió un error al subir la imagen.';
      console.error('Error uploading image: ', e);
      return { data: null, error: errorMessage };
    }
  },
};
