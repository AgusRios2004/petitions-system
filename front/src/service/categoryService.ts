
import apiClient from "./apiClient";
import { ApiResponse, ICategory } from '@/types/common';

export const categoryService = {
    getAllCategories: async (): Promise<ICategory[]> => {
        try {
            const response = await apiClient.get('/category');
            return response.data.data;
        } catch (error: any) {
            console.error('Error fetching all categories:', error);
            throw new Error(error.response?.data?.error || 'Error al obtener las categorías');
        }
    },
};
