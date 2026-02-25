
import apiClient from "./apiClient";
import { ApiResponse, ICategory } from '@/types/common';

export const categoryService = {
    getAllCategories: async (): Promise<ICategory[]> => {
        try {
            const response = await apiClient.get('/category');
            return response.data.data;
        } catch (error: unknown) {
            const err = error as any;
            console.error('Error fetching all categories:', err);
            throw new Error(err.response?.data?.error || 'Error al obtener las categorías');
        }
    },
};
