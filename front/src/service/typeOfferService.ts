import apiClient from './apiClient';
import { ApiResponse, ITypeOffer } from '@/types/common';

export const typeOfferService = {
  getAllTypeOffers: async (): Promise<ApiResponse<ITypeOffer[]>> => {
    const response = await apiClient.get(`/type-offer`);
    return response.data;
  },
};