
import apiClient from "./apiClient";
import { ApiResponse, ICategory } from '@/types/common';

export const categoryService = {
    getAllCategories: async (): Promise<ApiResponse<ICategory[]>> => {
        try {
            const response = await apiClient.get('/category');
            return { data: response.data.data, error: null };
        } catch (error: any) {
            console.error('Error fetching all categories:', error);
            return { data: null, error: error.message || 'Error al obtener las categorías' };
        }
    },
};
