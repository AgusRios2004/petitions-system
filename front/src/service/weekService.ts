import apiClient from "./apiClient";
import { ApiResponse, IWeek } from "@/types/common";

export const weekService = {
    getAllWeeks: async () : Promise<ApiResponse<IWeek[]>> => {
        try {
            const response = await apiClient.get('/weeks');
            return { data: response.data.data, error: null };
        } catch (e) {
            console.error("Error fetching weeks:", e);
            return { data: null, error: (e as Error).message || 'Error al obtener las semanas' };
        }
    }
}