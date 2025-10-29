import apiClient from './apiClient';
import { ApiResponse, IAvailability } from '@/types/common';

// Definimos una interfaz para los parámetros de filtro
interface AvailabilityParams {
    id_week?: number;
}

export const availabilityService = {
    getAllAvailabilities: async (params: AvailabilityParams = {}): Promise<ApiResponse<IAvailability[]>> => {
        try {
            // Pasamos los parámetros al método get de apiClient
            const response = await apiClient.get('/availability/me', { params });
            return { data: response.data.data, error: null };
        } catch (error: any) {
            console.error('Error fetching all availabilities:', error);
            return { data: null, error: error.message || 'Error al obtener las disponibilidades' };
        }
    },
}