import apiClient from "./apiClient";
import { ApiResponse, TypePetition } from "@/types/common";

export async function getTypePetitions(): Promise<ApiResponse<TypePetition[]>> {
    try {
        const response = await apiClient.get('/type-petitions');
        return { data: response.data.data, error: null };
    } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || "An unknown error occurred";
        return { data: null, error: errorMessage };
    }
}
