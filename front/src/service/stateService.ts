import { AxiosError } from "axios";
import apiClient from "./apiClient";
import { ApiResponse, IState } from "@/types/common";

export const stateService = {
    getAllStates: async (): Promise<ApiResponse<IState[]>> => {
        try {
            const response = await apiClient.get('/states');
            return { data: response.data.data, error: null };
        } catch (error: unknown) {
            const err = error as AxiosError;
            console.error('Error fetching states:', err);
            return { data: null, error: err.message || 'Error al obtener los estados' };
        }
    }
};