import apiClient from "./apiClient";
import { IInterest } from '@/types/common';

export interface CreateInterestPayload {
  id_customer: number;
  id_category: number;
}

export const interestService = {
  /**
   * Obtiene todos los intereses de un cliente específico.
   */
  getInterestsByCustomer: async (customerId: number): Promise<IInterest[]> => {
    try {
      const response = await apiClient.get(`/interests/customer/${customerId}`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error al obtener los intereses del cliente:', error);
      throw new Error(error.response?.data?.error || 'Error al obtener los intereses del cliente');
    }
  },

  /**
   * Añade un nuevo interés (categoría) a un cliente.
   */
  addInterest: async (payload: CreateInterestPayload): Promise<IInterest> => {
    try {
      const response = await apiClient.post('/interests', payload);
      return response.data.data;
    } catch (error: any) {
      console.error('Error añadiendo el interés:', error);
      throw new Error(error.response?.data?.error || 'Error al añadir el interés');
    }
  },

  /**
   * Elimina un interés específico por su ID.
   */
  deleteInterest: async (interestId: number): Promise<any> => {
    try {
      const response = await apiClient.delete(`/interests/${interestId}`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error eliminando interes:', error);
      throw new Error(error.response?.data?.error || 'Error al eliminar el interés');
    }
  },
};