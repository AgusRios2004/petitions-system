import apiClient from './apiClient';
import { IGradeForm } from '@/types/common';

export const gradeService = {
    getGrades: async (filters?: { id_user_create?: number }) => {
        try {
            const response = await apiClient.get('/grade', { params: filters });
            return response.data.data || response.data;
        } catch (error) {
            console.error('Error fetching grades:', error);
            throw error;
        }
    },

    createGrade: async (data: IGradeForm) => {
        try {
            const response = await apiClient.post('/grade', data);
            return response.data;
        } catch (error) {
            console.error('Error creating grade:', error);
            throw error;
        }
    }
};