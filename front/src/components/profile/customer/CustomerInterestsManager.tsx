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

  // 1. Query para obtener los intereses actuales del cliente
  const { data: customerInterests, isLoading: isLoadingCustomerInterests } = useQuery<IInterest[]>({
    queryKey: ['customerInterests', customerId],
    queryFn: () => interestService.getInterestsByCustomer(customerId),
    enabled: !!customerId,
  });

  // 2. Query para obtener todas las categorías disponibles (para el combo de añadir)
  const { data: allCategories, isLoading: isLoadingAllCategories } = useQuery<ICategory[]>({
    queryKey: ['allCategories'],
    queryFn: categoryService.getAllCategories,
  });

  // 3. Mutación para añadir un interés
  const addInterestMutation = useMutation({
    mutationFn: (payload: CreateInterestPayload) => interestService.addInterest(payload),
    onSuccess: () => {
      toast.success('Interés añadido');
      setSelectedCategoryToAdd(0); // Limpiar selección del combo
      queryClient.invalidateQueries({ queryKey: ['customerInterests', customerId] }); // Refrescar la lista
    },
    onError: (error: any) => toast.error(`Error: ${error.message}`),
  });

  // 4. Mutación para eliminar un interés
  const deleteInterestMutation = useMutation({
    mutationFn: (interestId: number) => interestService.deleteInterest(interestId),
    onSuccess: () => {
      toast.success('Interés eliminado');
      queryClient.invalidateQueries({ queryKey: ['customerInterests', customerId] }); // Refrescar la lista
    },
    onError: (error: any) => toast.error(`Error: ${error.message}`),
  });

  // --- Manejadores de Eventos ---
  const handleAddInterest = () => {
    if (selectedCategoryToAdd > 0) {
      addInterestMutation.mutate({ id_customer: customerId, id_category: selectedCategoryToAdd });
    }
  };

  // Filtra las categorías que el cliente ya tiene para no mostrarlas en el combo de añadir
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
                  onClick={() => deleteInterestMutation.mutate(interest.id_interest)} 
                  className="ml-3 font-bold text-xl text-white hover:text-gray-200" 
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
        <div className="flex items-end gap-2">
          <div className="flex-grow">
            <Select 
              label="Seleccione una categoría" 
              options={availableCategoriesToAdd?.map(c => ({ value: c.id_category, label: c.name })) || []}
              value={selectedCategoryToAdd || 0}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCategoryToAdd(Number(e.target.value))}
              disabled={isLoadingAllCategories || addInterestMutation.isPending}
              placeholder="Ver categorías disponibles..." 
              className="w-full" // Asegura que el select ocupe todo el ancho disponible
            />
          </div>
          <Button 
            type="button" 
            onClick={handleAddInterest} 
            disabled={!selectedCategoryToAdd || addInterestMutation.isPending} 
            variant="secondary"
            className="px-4 py-2 text-sm" // Ajusta el padding y tamaño de texto del botón
          >
            {addInterestMutation.isPending ? '...' : 'Añadir'}
          </Button>
        </div>
      </div>
    </div>
  );
};