import { IProvider } from "@/types/common";
import apiClient from "./apiClient";

export const providerService = {
    getProfilePublicProvider: async (id_provider: string): Promise<IProvider> => {
        try {
            const response = await apiClient.get(`/provider/public/${id_provider}`);
            return response.data;
        } catch (e) {
            console.error(`Error fetching provider profile with ID ${id_provider}:`, e);
            throw e;
        }
    }
};