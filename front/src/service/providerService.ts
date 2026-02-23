import {ApiResponse, IProvider, UpdateProviderPayload} from "@/types/common";
import apiClient from "./apiClient";

export async function getProfilePublicProvider(id_provider: string): Promise<IProvider> {
    try {
        const response = await apiClient.get(`/provider/public/${id_provider}`);
        return response.data.data;
    } catch (e) {
        console.error(`Error fetching provider profile with ID ${id_provider}:`, e);
        throw e;
    }
}

export async function getProviderByIdWithDetails(id_provider: number): Promise<IProvider> {
    try {
        const response = await apiClient.get(`/provider/details/${id_provider}`);
        return response.data.data;
    } catch (e: any) {
        console.error("Error: ", e);
        throw e.message;
    }
}

export async function updateProvider(providerId: number, payload: UpdateProviderPayload): Promise<ApiResponse<IProvider>>{
    try {
        const response = await apiClient.put(`/provider/${providerId}`, payload);
        return response.data.data;
    } catch (e: any) {
        console.error('Error: ', e.message);
        throw e;
    }
}