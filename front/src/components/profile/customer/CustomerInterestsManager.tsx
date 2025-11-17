'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { interestService, CreateInterestPayload } from '@/service/interestService';
import { categoryService } from '@/service/categoryService';
import { IInterest, ICategory } from '@/types/common';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
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
    onError: (error: any) => toast.error(`Error: ${error.message}`),
  });

  const deleteInterestMutation = useMutation({
    mutationFn: (interestId: number) => interestService.deleteInterest(interestId),
    onSuccess: () => {
      toast.success('Interés eliminado');
      queryClient.invalidateQueries({ queryKey: ['customerInterests', customerId] });
    },
    onError: (error: any) => toast.error(`Error: ${error.message}`),
  });

  const handleAddInterest = () => {
    if (selectedCategoryToAdd > 0) {
      addInterestMutation.mutate({ id_customer: customerId, id_category: selectedCategoryToAdd });
    }
  };

  const availableCategoriesToAdd = allCategories?.filter(
    (cat) => !customerInterests?.some((ci) => ci.category.id_category === cat.id_category)
  );

  return (
    <div className="space-y-6 p-4 bg-gray-800 rounded-lg">
      <h3 className="text-2xl font-bold text-white mb-6">Mis Intereses</h3>
      
      {/* Lista de Intereses Actuales */}
      {isLoadingCustomerInterests ? <p className="text-sky-400">Cargando mis intereses...</p> :
        <div className="flex flex-wrap gap-3 mb-6">
          {customerInterests && customerInterests.length > 0 ? (
            customerInterests.map((interest) => (
              <div key={interest.id_interest} className="flex items-center bg-sky-600 text-white px-4 py-2 rounded-full text-md font-medium">
                <span>{interest.category.name}</span>
                <button 
                  type="button" 
                  onClick={() => {
                    if (window.confirm('¿Estás seguro de que quieres eliminar este interés?')) {
                      deleteInterestMutation.mutate(interest.id_interest);
                    }
                  }} 
                  className="ml-3 font-bold text-xl text-white hover:text-gray-200 cursor-pointer" 
                  disabled={deleteInterestMutation.isPending}
                >
                  &times;
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-400">Aún no has añadido ningún interés.</p>
          )}
        </div>
      }
      
      {/* Sección para Añadir Nuevo Interés */}
      <div className="pt-6 border-t border-gray-700">
        <h4 className="text-xl font-semibold text-white mb-4">Añadir Nuevo Interés</h4>
        <div className="flex items-end gap-4">
          {/* El combo ahora ocupa 3/4 del espacio */}
          <div className="w-3/4">
            <Select 
              label="Seleccione una categoría" 
              options={availableCategoriesToAdd?.map(c => ({ value: c.id_category, label: c.name })) || []}
              value={selectedCategoryToAdd || 0}
              // CORRECCIÓN: El onChange ahora es más robusto
              onChange={(value) => setSelectedCategoryToAdd(Number(value) || 0)}
              disabled={isLoadingAllCategories || addInterestMutation.isPending}
              placeholder="Ver categorías disponibles..." 
            />
          </div>
          {/* El botón ahora ocupa 1/4 del espacio */}
          <div className="w-1/4">
            <Button 
              type="button" 
              onClick={handleAddInterest} 
              disabled={!selectedCategoryToAdd || addInterestMutation.isPending} 
              variant="secondary"
              fullWidth={true}
              size="md"
            >
              {addInterestMutation.isPending ? '...' : 'Añadir'}
            </Button>
          </div>
        </div> {/* <-- CORRECCIÓN: Esta es la llave de cierre que faltaba */}
      </div>
    </div>
  );
};
