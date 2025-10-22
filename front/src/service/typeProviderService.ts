import apiClient from "./apiClient";
import { ApiResponse, TypeProvider } from "@/types/common";

export async function getTypeProviders(): Promise<ApiResponse<TypeProvider[]>> {
    try {
        const response = await apiClient.get('/api/type-providers');
        return { data: response.data.data, error: null };
    } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || "An unknown error occurred";
        return { data: null, error: errorMessage };
    }
}
