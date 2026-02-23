import apiClient from "./apiClient";
import { ApiResponse, IState } from "@/types/common";

export const stateService = {
    getAllStates: async (): Promise<ApiResponse<IState[]>> => {
        try {
            const response = await apiClient.get('/states');
            return { data: response.data.data, error: null };
        } catch (error: any) {
            console.error('Error fetching states:', error);
            return { data: null, error: error.message || 'Error al obtener los estados' };
        }
    }
};