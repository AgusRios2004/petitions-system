import apiClient from './apiClient';
import { ApiResponse, IAvailability } from '@/types/common';

export const availabilityService = {
    getAllAvailabilities: async (): Promise<ApiResponse<IAvailability[]>> => {
        try {
            const response = await apiClient.get('/availability/me');
            return { data: response.data.data, error: null };
        } catch (error: any) {
            console.error('Error fetching all availabilities:', error);
            return { data: null, error: error.message || 'Error al obtener las disponibilidades' };
        }
    },
}