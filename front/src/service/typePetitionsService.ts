import { AxiosError } from "axios";
import apiClient from "./apiClient";
import { ApiResponse, TypePetition } from "@/types/common";

export async function getTypePetitions(): Promise<ApiResponse<TypePetition[]>> {
    try {
        const response = await apiClient.get('/type-petitions');
        return { data: response.data.data, error: null };
    } catch (error: unknown) {
        const err = error as AxiosError<{ message?: string }>;
        const errorMessage = err.response?.data?.message || err.message || "An unknown error occurred";
        return { data: null, error: errorMessage };
    }
}
