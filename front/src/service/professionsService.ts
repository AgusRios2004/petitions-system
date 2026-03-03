import { AxiosError } from "axios";
import apiClient from "./apiClient";
import { ApiResponse, Profession } from "@/types/common";

export async function getProfessions(): Promise<ApiResponse<Profession[]>> {
    try {
        const response = await apiClient.get('/professions');
        return { data: response.data.data, error: null };
    } catch (error: unknown) {
        const err = error as AxiosError<{ message?: string }>;
        const errorMessage = err.response?.data?.message || err.message || "An unknown error occurred";
        return { data: null, error: errorMessage };
    }
}
