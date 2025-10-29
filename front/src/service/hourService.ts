import apiClient from "./apiClient";
import { ApiResponse, IHour } from "@/types/common";

export const hourService = {
    getAllHours: async () : Promise<ApiResponse<IHour[]>> => {
        try {
            const response = await apiClient.get('/hours');
            return { data: response.data.data, error: null };
        } catch (e) {
            console.error("Error fetching hours:", e);
            return { data: null, error: (e as Error).message || 'Error al obtener las horas' };
        }
    }
}