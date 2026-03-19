'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { interestService, CreateInterestPayload } from '@/service/interestService';
import { categoryService } from '@/service/categoryService';
import { IInterest, ICategory } from '@/types/common';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { FiTag } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface CustomerInterestsManagerProps {
  customerId: number;
}

export const CustomerInterestsManager: React.FC<CustomerInterestsManagerProps> = ({ customerId }) => {
  const queryClient = useQueryClient();
  const [selectedCategoryToAdd, setSelectedCategoryToAdd] = useState<number>(0);

  // Queries y Mutations (sin cambios)
  const { data: customerInterests, isLoading: isLoadingCustomerInterests } = useQuery<IInterest[]>({
    queryKey: ['customerInterests', customerId],
    queryFn: () => interestService.getInterestsByCustomer(customerId),
    enabled: !!customerId,
  });

  const { data: allCategories, isLoading: isLoadingAllCategories } = useQuery<ICategory[]>({
    queryKey: ['allCategories'],
    queryFn: categoryService.getAllCategories,
  });

  const addInterestMutation = useMutation({
    mutationFn: (payload: CreateInterestPayload) => interestService.addInterest(payload),
    onSuccess: () => {
      toast.success('Interés añadido');
      setSelectedCategoryToAdd(0);
      queryClient.invalidateQueries({ queryKey: ['customerInterests', customerId] });
    },
    onError: (error: unknown) => {
      const err = error as Error;
      toast.error(`Error: ${err.message}`);
    },
  });

  const deleteInterestMutation = useMutation({
    mutationFn: (interestId: number) => interestService.deleteInterest(interestId),
    onSuccess: () => {
      toast.success('Interés eliminado');
      queryClient.invalidateQueries({ queryKey: ['customerInterests', customerId] });
    },
    onError: (error: unknown) => {
      const err = error as Error;
      toast.error(`Error: ${err.message}`);
    },
  });

  const handleAddInterest = (categoryId: number) => {
    if (categoryId > 0) {
      addInterestMutation.mutate({ id_customer: customerId, id_category: categoryId });
    }
  };

  const availableCategoriesToAdd = allCategories?.filter(
    (cat) => !customerInterests?.some((ci) => ci.category.id_category === cat.id_category)
  );

  return (
    <div className="space-y-6 p-6 bg-gray-800 rounded-2xl border border-gray-700 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-2xl font-bold text-white">Mis Intereses</h3>
          <p className="text-gray-400 text-sm mt-1">
            Matchea con proveedores que ofrezcan estos servicios
          </p>
        </div>
        <div className="hidden sm:block p-2 bg-sky-900/30 rounded-lg">
          <FiTag className="text-sky-400" size={24} />
        </div>
      </div>

      {/* Lista de Intereses Actuales */}
      <div className="min-h-[60px]">
        {isLoadingCustomerInterests ? (
          <div className="flex space-x-2 animate-pulse">
            <div className="h-10 w-24 bg-gray-700 rounded-full"></div>
            <div className="h-10 w-32 bg-gray-700 rounded-full"></div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {customerInterests && customerInterests.length > 0 ? (
              customerInterests.map((interest) => (
                <div
                  key={interest.id_interest}
                  className="group flex items-center bg-sky-600/20 text-sky-300 border border-sky-500/30 px-4 py-2 rounded-full text-sm font-semibold transition-all hover:bg-sky-600/30"
                >
                  <span>{interest.category.name}</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('¿Estás seguro de que quieres eliminar este interés?')) {
                        deleteInterestMutation.mutate(interest.id_interest);
                      }
                    }}
                    className="ml-2.5 flex items-center justify-center w-5 h-5 rounded-full hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                    disabled={deleteInterestMutation.isPending}
                  >
                    <span className="text-lg leading-none">&times;</span>
                  </button>
                </div>
              ))
            ) : (
              <div className="w-full py-4 text-center border-2 border-dashed border-gray-700 rounded-xl">
                <p className="text-gray-500">No has seleccionado intereses todavía.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sección para Añadir Nuevo Interés */}
      <div className="pt-6 border-t border-gray-700">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Buscar y Añadir Interés
        </label>
        <div className="relative group">
          <Select
            label=""
            options={availableCategoriesToAdd?.map(c => ({ value: c.id_category, label: c.name })) || []}
            value={0} // Reiniciamos siempre a 0 tras añadir
            onChange={(value) => handleAddInterest(Number(value) || 0)}
            disabled={isLoadingAllCategories || addInterestMutation.isPending}
            placeholder="Escribe para buscar categorías..."
            menuPlacement="top" // Forzamos a que abra hacia ARRIBA
          />
          {addInterestMutation.isPending && (
            <div className="absolute right-10 top-1/2 -translate-y-1/3">
              <div className="w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
        <p className="mt-2 text-xs text-gray-500 italic">
          * El interés se añade automáticamente al seleccionarlo.
        </p>
      </div>

      {/* Sugerencias Rápidas (Opcional - Mejora UX) */}
      {availableCategoriesToAdd && availableCategoriesToAdd.length > 0 && (
        <div className="pt-4">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-3">Sugerencias</span>
          <div className="flex flex-wrap gap-2">
            {availableCategoriesToAdd.slice(0, 5).map(cat => (
              <button
                key={cat.id_category}
                type="button"
                onClick={() => handleAddInterest(cat.id_category)}
                disabled={addInterestMutation.isPending}
                className="text-xs bg-gray-700/50 hover:bg-gray-700 text-gray-400 hover:text-white px-3 py-1.5 rounded-lg border border-gray-600/50 transition-all cursor-pointer"
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

