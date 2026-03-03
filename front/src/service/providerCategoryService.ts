import apiClient from "./apiClient";
import { IProviderCategory } from '@/types/common';

export interface CreateProviderCategoryPayload {
  id_provider: number;
  id_category: number;
}

export const providerCategoryService = {
  /**
   * Adds a new category to a provider.
   */
  addCategoryToProvider: async (payload: CreateProviderCategoryPayload): Promise<IProviderCategory> => {
    try {
      // Assuming a new endpoint for this, analogous to interests
      const response = await apiClient.post('/provider-category', payload);
      return response.data.data;
    } catch (error: unknown) {
      console.error('Error adding category to provider:', error);
      const err = error as { response?: { data?: { error?: string } } };
      throw new Error(err.response?.data?.error || 'Error al añadir la categoría');
    }
  },

  /**
   * Removes a category from a provider by the relationship ID.
   */
  removeCategoryFromProvider: async (providerCategoryId: number): Promise<void> => {
    try {
      // Assuming a new endpoint for this, analogous to interests
      await apiClient.delete(`/provider-category/${providerCategoryId}`);
    } catch (error: unknown) {
      console.error('Error removing category from provider:', error);
      const err = error as { response?: { data?: { error?: string } } };
      throw new Error(err.response?.data?.error || 'Error al eliminar la categoría');
    }
  },

};
