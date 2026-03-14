'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { availabilityService } from '@/service/availabilityService';
import Tabs from '@/components/ui/Tabs';
import AvailabilityCard from './AvailabilityCard';
// 1. IMPORTAMOS EL NUEVO FORMULARIO DE EDICIÓN
import { Button } from '@/components/ui/Button';
import EditAvailabilityForm from './EditAvailabilityForm';
import CreateAvailabilityForm from './CreateAvailabilityForm'; // Importa el formulario de creación
import { IAvailability } from '@/types/common';
import toast from 'react-hot-toast';

const availabilityTabs = [
  { label: 'Todos', value: 0 },
  { label: 'Lunes', value: 1 },
  { label: 'Martes', value: 2 },
  { label: 'Miércoles', value: 3 },
  { label: 'Jueves', value: 4 },
  { label: 'Viernes', value: 5 },
  { label: 'Sábado', value: 6 },
  { label: 'Domingo', value: 7 },
];

const ProviderAvailability = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false); // Estado para mostrar/ocultar el formulario de creación

  const queryClient = useQueryClient();

  const { data, isError, isLoading, error } = useQuery({
    queryKey: ['availabilities', activeTab],
    queryFn: () => {
      const params = activeTab !== 0 ? { id_week: activeTab } : {};
      return availabilityService.getAllAvailabilities(params);
    },
    select: (response) => response.data,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => availabilityService.deleteAvailability(id),
    onSuccess: () => {
      console.log('Disponibilidad eliminada con éxito');
      queryClient.invalidateQueries({ queryKey: ['availabilities'] });
      toast.success('Disponibilidad eliminada con éxito.');
    },
    onError: (err) => {
      console.error('Error al eliminar la disponibilidad:', err);
      toast.error('Error al eliminar la disponibilidad.');
    },
  });

  const handleTabChange = (newTab: number) => {
    setActiveTab(newTab);
  };

  const handleEdit = (id: number) => {
    setEditingId(id);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta disponibilidad?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleFinishedCreation = () => {
    setIsCreating(false);
    queryClient.invalidateQueries({ queryKey: ['availabilities', activeTab] });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {editingId && (
        <EditAvailabilityForm
          availabilityId={editingId}
          onFinished={handleCancelEdit}
        />
      )}

      {isCreating && (
        <CreateAvailabilityForm onFinished={handleFinishedCreation} />
      )}

      <div className="text-center space-y-4 mb-10 bg-gray-900/30 p-8 rounded-3xl border border-white/5 backdrop-blur-sm">
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          Gestionar <span className="text-cyan-500">Disponibilidad</span>
        </h2>
        <p className="text-gray-400 max-w-xl mx-auto text-sm sm:text-base">
          Define tus horarios de trabajo para que los clientes puedan encontrarte fácilmente.
          Un calendario actualizado aumenta tus posibilidades de ser contratado.
        </p>
        <div className="flex justify-end pt-2">
          <Button
            className="w-full sm:w-auto bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 font-bold shadow-lg shadow-cyan-900/20 px-6 py-3 rounded-xl text-xs uppercase tracking-widest transform transition duration-300 hover:scale-[1.02] active:scale-95"
            onClick={() => setIsCreating(true)}
          >
            Crear Nuevo Horario
          </Button>
        </div>
      </div>

      <div className="flex justify-center mb-8 overflow-x-auto scrollbar-hide py-2">
        <div className="bg-gray-950/40 backdrop-blur-md p-1.5 rounded-2xl border border-white/5">
          <Tabs
            tabs={availabilityTabs}
            activeTab={activeTab}
            onTabClick={handleTabChange}
          />
        </div>
      </div>

      {isLoading && <p className="text-center text-gray-400">Cargando disponibilidad...</p>}
      {isError && <p className="text-center text-red-500">Error: {error?.message}</p>}

      {data && data.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
          {data.map((availability: IAvailability) => (
            <AvailabilityCard
              key={availability.id_availability}
              availability={availability}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        !isLoading && (
          <div className="text-center py-10">
            <h3 className="text-xl font-semibold text-white">No hay disponibilidad para el día seleccionado</h3>
            <p className="text-gray-400 mt-2">Prueba a seleccionar otro día o añade nuevos horarios.</p>
          </div>
        )
      )}
    </div>
  );
};

export default ProviderAvailability;