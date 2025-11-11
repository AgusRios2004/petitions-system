import apiClient from "./apiClient";
import { IInterest } from '@/types/common';

// Devuelve los datos directamente o lanza un error
export const interestService = {
  getInterestsByCategory: async (categoryId: number): Promise<IInterest[]> => {
    try {
      const response = await apiClient.get(`/interests/category/${categoryId}`);
      // Asumiendo que la respuesta del backend tiene el formato { data: [...] }
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching interests by category:', error);
      throw new Error(error.response?.data?.error || 'Error al obtener los intereses');
    }
  },
};
