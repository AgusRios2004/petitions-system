import apiClient from './apiClient';
import { ApiResponse, IAvailability } from '@/types/common';

// Definimos una interfaz para los parámetros de filtro
interface AvailabilityParams {
    id_week?: number;
}

// --- ¡AQUÍ LA SOLUCIÓN! ---
// 1. Definimos una interfaz específica para el PAYLOAD de la actualización.
// Esto describe exactamente lo que la API espera en un PUT/PATCH.
export interface IUpdateAvailabilityPayload {
    id_week: number;
    id_from_hour: number;
    id_until_hour: number;
}

export const availabilityService = {
    getAllAvailabilities: async (params: AvailabilityParams = {}): Promise<ApiResponse<IAvailability[]>> => {
        try {
            // Pasamos los parámetros al método get de apiClient
            const response = await apiClient.get('/availability/me', { params });
            return { data: response.data.data, error: null };
        } catch (error: unknown) {
            const err = error as Error;
            console.error('Error fetching all availabilities:', err);
            return { data: null, error: err.message || 'Error al obtener las disponibilidades' };
        }
    },

    getAvailabilityById: async (id: number): Promise<ApiResponse<IAvailability>> => {
        try {
            const response = await apiClient.get(`/availability/${id}`);
            return { data: response.data.data, error: null };
        } catch (error: unknown) {
            const err = error as Error;
            console.error('Error fetching availability by ID:', err);
            return { data: null, error: err.message || 'Error al obtener la disponibilidad' };
        }
    },

    deleteAvailability: async (id: number): Promise<ApiResponse<null>> => {
        try {
            await apiClient.delete(`/availability/me/${id}`);
            return { data: null, error: null };
        } catch (error: unknown) {
            const err = error as Error;
            console.error('Error deleting availability:', err);
            return { data: null, error: err.message || 'Error al eliminar la disponibilidad' };
        }
    },

    // 2. Usamos la nueva interfaz en la firma de la función.
    updateAvailability: async (id: number, payload: IUpdateAvailabilityPayload): Promise<ApiResponse<IAvailability>> => {
        try {
            const response = await apiClient.put(`/availability/me/${id}`, payload);
            return { data: response.data.data, error: null };
        } catch (error: unknown) {
            const err = error as Error;
            console.error('Error updating availability:', err);
            return { data: null, error: err.message || 'Error al actualizar la disponibilidad' };
        }
    },

    createAvailability: async (payload: { id_week: string; id_from_hour: string; id_until_hour: string; }): Promise<ApiResponse<IAvailability>> => {
        try {
            const response = await apiClient.post('/availability/me', payload);
            return { data: response.data.data, error: null };
        } catch (error: unknown) {
            const err = error as Error;
            console.error('Error creating availability:', err);
            return { data: null, error: err.message || 'Error al crear la disponibilidad' };
        }
    },
}