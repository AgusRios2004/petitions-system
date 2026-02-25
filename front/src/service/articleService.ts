import apiClient from "./apiClient";
import { ApiResponse, IArticle } from '@/types/common';

export const articleService = {
    getAllArticles: async (filters?: { id_category?: number; name?: string }): Promise<ApiResponse<IArticle[]>> => {
        try {
            const response = await apiClient.get('/article', { params: filters });
            return { data: response.data.data, error: null };
        } catch (error: unknown) {
            const err = error as Error;
            console.error('Error fetching all articles:', err);
            return { data: null, error: err.message || 'Error al obtener los artículos' };
        }
    },

    getArticleById: async (id: number): Promise<ApiResponse<IArticle>> => {
        try {
            const response = await apiClient.get(`/article/${id}`);
            return { data: response.data, error: null };
        } catch (error: any) {
            console.error(`Error fetching article with ID ${id}:`, error);
            return { data: null, error: error.message || `Error al obtener el artículo con ID ${id}` };
        }
    },
};