'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { providerCategoryService, CreateProviderCategoryPayload } from '@/service/providerCategoryService';
import { categoryService } from '@/service/categoryService';
import { ICategory, IProviderCategory } from '@/types/common';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

interface ProviderCategoriesManagerProps {
  providerId: number;
  currentCategories: IProviderCategory[];
}

export const ProviderCategoriesManager: React.FC<ProviderCategoriesManagerProps> = ({ providerId, currentCategories }) => {
  const queryClient = useQueryClient();
  const [categoryToAdd, setCategoryToAdd] = useState<number>(0);

  const { data: allCategories, isLoading: isLoadingAllCategories } = useQuery<ICategory[]>({
    queryKey: ['allCategories'],
    queryFn: categoryService.getAllCategories,
  });

  const addCategoryMutation = useMutation({
    mutationFn: (payload: CreateProviderCategoryPayload) => providerCategoryService.addCategoryToProvider(payload),
    onSuccess: () => {
      toast.success('Categoría añadida');
      setCategoryToAdd(0);
      queryClient.invalidateQueries({ queryKey: ['providerPublicProfile', providerId] });
    },
    onError: (error: any) => toast.error(`Error: ${error.message}`),
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (providerCategoryId: number) => providerCategoryService.removeCategoryFromProvider(providerCategoryId),
    onSuccess: () => {
      toast.success('Categoría eliminada');
      queryClient.invalidateQueries({ queryKey: ['providerPublicProfile', providerId] });
    },
    onError: (error: any) => toast.error(`Error: ${error.message}`),
  });

  const handleAddCategory = () => {
    if (categoryToAdd > 0) {
      addCategoryMutation.mutate({ id_provider: providerId, id_category: categoryToAdd });
    }
  };

  const availableCategoriesToAdd = allCategories?.filter(
    (cat) => !currentCategories?.some((pc) => pc.category.id_category === cat.id_category)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 mb-6">
        {currentCategories && currentCategories.length > 0 ? (
          currentCategories.map((pc) => (
            <div key={pc.id} className="flex items-center bg-sky-600 text-white px-4 py-2 rounded-full text-md font-medium">
              <span>{pc.category.name}</span>
              <button 
                type="button" 
                onClick={() => {
                  if (window.confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
                    deleteCategoryMutation.mutate(pc.id);
                  }
                }} 
                className="ml-3 font-bold text-xl text-white hover:text-gray-200 cursor-pointer" 
                disabled={deleteCategoryMutation.isPending}
              >
                &times;
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-400">Este proveedor aún no ha añadido ninguna categoría.</p>
        )}
      </div>
      
      <div className="pt-6 border-t border-gray-700">
        <h4 className="text-xl font-semibold text-white mb-4">Añadir Nueva Categoría</h4>
        <div className="flex items-end gap-4">
          <div className="w-3/4">
            <Select 
              label="Seleccione una categoría" 
              options={availableCategoriesToAdd?.map(c => ({ value: c.id_category, label: c.name })) || []}
              value={categoryToAdd || 0}
              onChange={(value) => setCategoryToAdd(Number(value) || 0)}
              disabled={isLoadingAllCategories || addCategoryMutation.isPending}
              placeholder="Ver categorías disponibles..." 
            />
          </div>
          <div className="w-1/4">
            <Button 
              type="button" 
              onClick={handleAddCategory} 
              disabled={!categoryToAdd || addCategoryMutation.isPending} 
              variant="secondary"
              fullWidth={true}
              size="md"
            >
              {addCategoryMutation.isPending ? '...' : 'Añadir'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
