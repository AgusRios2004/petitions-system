'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { providerCategoryService, CreateProviderCategoryPayload } from '@/service/providerCategoryService';
import { categoryService } from '@/service/categoryService';
import { ICategory, IProviderCategory } from '@/types/common';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { FiTag } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface ProviderCategoriesManagerProps {
  providerId: number;
  currentCategories: IProviderCategory[];
}

export const ProviderCategoriesManager: React.FC<ProviderCategoriesManagerProps> = ({ providerId, currentCategories }) => {
  const queryClient = useQueryClient();

  const { data: allCategories, isLoading: isLoadingAllCategories } = useQuery<ICategory[]>({
    queryKey: ['allCategories'],
    queryFn: categoryService.getAllCategories,
  });

  const addCategoryMutation = useMutation({
    mutationFn: (payload: CreateProviderCategoryPayload) => providerCategoryService.addCategoryToProvider(payload),
    onSuccess: () => {
      toast.success('Categoría añadida');
      queryClient.invalidateQueries({ queryKey: ['providerPublicProfile', providerId] });
      queryClient.invalidateQueries({ queryKey: ['providerProfile', providerId] });
    },
    onError: (error: unknown) => {
      const err = error as Error;
      toast.error(`Error: ${err.message}`);
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (providerCategoryId: number) => providerCategoryService.removeCategoryFromProvider(providerCategoryId),
    onSuccess: () => {
      toast.success('Categoría eliminada');
      queryClient.invalidateQueries({ queryKey: ['providerPublicProfile', providerId] });
      queryClient.invalidateQueries({ queryKey: ['providerProfile', providerId] });
    },
    onError: (error: unknown) => {
      const err = error as Error;
      toast.error(`Error: ${err.message}`);
    },
  });

  const handleAddCategory = (categoryId: number) => {
    if (categoryId > 0) {
      addCategoryMutation.mutate({ id_provider: providerId, id_category: categoryId });
    }
  };

  const availableCategoriesToAdd = allCategories?.filter(
    (cat) => !currentCategories?.some((pc) => pc.category.id_category === cat.id_category)
  );

  return (
    <div className="space-y-6">
      {/* Lista de Categorías Actuales */}
      <div className="min-h-[40px]">
        {currentCategories && currentCategories.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {currentCategories.map((pc) => (
              <div
                key={pc.id}
                className="group flex items-center bg-blue-600/20 text-blue-300 border border-blue-500/30 px-4 py-2 rounded-full text-sm font-semibold transition-all hover:bg-blue-600/30"
              >
                <span>{pc.category.name}</span>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
                      deleteCategoryMutation.mutate(pc.id);
                    }
                  }}
                  className="ml-2.5 flex items-center justify-center w-5 h-5 rounded-full hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                  disabled={deleteCategoryMutation.isPending}
                >
                  <span className="text-lg leading-none">&times;</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full py-6 text-center border-2 border-dashed border-gray-700 rounded-xl">
            <p className="text-gray-500">Aún no has seleccionado tus categorías de servicio.</p>
          </div>
        )}
      </div>

      {/* Sección para Añadir Nueva Categoría */}
      <div className="pt-6 border-t border-gray-700">
        <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
          <FiTag className="mr-2 text-blue-400/70" />
          Añadir Negocio / Categoría
        </label>
        <div className="relative group">
          <Select
            label=""
            options={availableCategoriesToAdd?.map(c => ({ value: c.id_category, label: c.name })) || []}
            value={0}
            onChange={(value) => handleAddCategory(Number(value) || 0)}
            disabled={isLoadingAllCategories || addCategoryMutation.isPending}
            placeholder="Escribe para buscar y añadir..."
            menuPlacement="top"
          />
          {addCategoryMutation.isPending && (
            <div className="absolute right-10 top-1/2 -translate-y-1/3">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
        <p className="mt-2 text-xs text-gray-500 italic">
          * La categoría se añade instantáneamente al seleccionarla.
        </p>
      </div>

      {/* Sugerencias Rápidas */}
      {availableCategoriesToAdd && availableCategoriesToAdd.length > 0 && (
        <div className="pt-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-500 block mb-3">Sugerencias más buscadas</span>
          <div className="flex flex-wrap gap-2">
            {availableCategoriesToAdd.slice(0, 6).map(cat => (
              <button
                key={cat.id_category}
                type="button"
                onClick={() => handleAddCategory(cat.id_category)}
                disabled={addCategoryMutation.isPending}
                className="text-xs bg-gray-700/30 hover:bg-gray-700/80 text-gray-400 hover:text-white px-3 py-2 rounded-lg border border-gray-700/50 transition-all cursor-pointer select-none"
              >
                + {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

