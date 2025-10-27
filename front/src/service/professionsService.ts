import apiClient from "./apiClient";
import { ApiResponse, Profession } from "@/types/common";

export async function getProfessions(): Promise<ApiResponse<Profession[]>> {
    try {
        const response = await apiClient.get('/professions');
        return { data: response.data.data, error: null };
    } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || "An unknown error occurred";
        return { data: null, error: errorMessage };
    }
}
