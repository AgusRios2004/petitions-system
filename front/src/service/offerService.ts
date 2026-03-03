import apiClient from './apiClient';
import { ApiResponse, IOffer } from '@/types/common';

export const offerService = {
  getOffersByProvider: async (providerId: number): Promise<ApiResponse<IOffer[]>> => {
    const response = await apiClient.get(`/offer/${providerId}/provider`);
    return response.data;
  },
  getAllOffers: async (filters: Record<string, string | number | boolean | null | undefined> = {}): Promise<ApiResponse<{ offers: IOffer[], totalItems: number }>> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
    const response = await apiClient.get(`/offer?${params.toString()}`);
    return response.data;
  },
  createOffer: async (offerData: Partial<IOffer>): Promise<ApiResponse<IOffer>> => {
    const response = await apiClient.post(`/offer`, offerData);
    return response.data;
  },
  deleteOffer: async (offerId: number): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/offer/${offerId}`);
    return response.data;
  }
};