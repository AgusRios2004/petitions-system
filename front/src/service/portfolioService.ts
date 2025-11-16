import apiClient from "./apiClient";
import { IPortfolioItem, ApiResponse } from "@/types/common";

export const portfolioService = {
    createPortfolio: async (formData: FormData): Promise<ApiResponse<IPortfolioItem>> => {
        try {
            const response = await apiClient.post('/portfolio', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            
            return response.data.data;
        } catch (e: any) {
            console.error("Error: ", e.message);
            throw e.message;
        }
    },
    getPortfolios: async(id_provider: number): Promise<ApiResponse<IPortfolioItem[]>> => {
        try {
            const response = await apiClient.get(`/portfolio/${id_provider}`);

            return response.data.data;
        } catch (e: any) {
            console.error("Error: ", e.message);
            throw e.message;
        }
    },
}