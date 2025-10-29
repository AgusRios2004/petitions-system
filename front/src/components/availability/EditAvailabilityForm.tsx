'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { availabilityService } from '@/service/availabilityService';
// Asumimos que tienes o crearás estos servicios para obtener las listas de días y horas
import { weekService } from '@/service/weekService'; 
import { hourService } from '@/service/hourService';
import { Button } from '@/components/ui/Button';

// Interfaz para las props del componente
interface EditAvailabilityFormProps {
  availabilityId: number;
  onFinished: () => void; // Función para cerrar el modal
}

// Interfaz para el estado del formulario
interface FormState {
  id_week: string;
  id_from_hour: string;
  id_until_hour: string;
}

const EditAvailabilityForm: React.FC<EditAvailabilityFormProps> = ({ availabilityId, onFinished }) => {
  const queryClient = useQueryClient();
  const [formState, setFormState] = useState<FormState>({
    id_week: '',
    id_from_hour: '',
    id_until_hour: '',
  });

  // 1. QUERY: Obtener los datos de la disponibilidad actual
  const { data: availabilityData, isLoading: isLoadingAvailability } = useQuery({
    queryKey: ['availability', availabilityId],
    queryFn: () => availabilityService.getAvailabilityById(availabilityId),
    enabled: !!availabilityId, // Solo se ejecuta si availabilityId no es null
    select: (response) => response.data,
  });

  // 2. QUERIES: Obtener las listas para los <select>
  const { data: weeks, isLoading: isLoadingWeeks } = useQuery({
    queryKey: ['weeks'],
    queryFn: () => weekService.getAllWeeks(), // Asume que este servicio existe
    select: (response) => response.data,
  });

  const { data: hours, isLoading: isLoadingHours } = useQuery({
    queryKey: ['hours'],
    queryFn: () => hourService.getAllHours(), // Asume que este servicio existe
    select: (response) => response.data,
  });

  // 3. EFFECT: Cuando los datos de la disponibilidad cargan, rellenamos el formulario
  useEffect(() => {
    if (availabilityData) {
      setFormState({
        id_week: String(availabilityData.week.id_week),
        id_from_hour: String(availabilityData.fromHour.id_hour),
        id_until_hour: String(availabilityData.untilHour.id_hour),
      });
    }
  }, [availabilityData]);

  // 4. MUTATION: Para enviar la actualización
  const updateMutation = useMutation({
    // La función ahora espera el tipo de dato correcto (lo transformaremos en handleSubmit)
    mutationFn: (updatedData: { id_week: number; id_from_hour: number; id_until_hour: number; }) => 
      availabilityService.updateAvailability(availabilityId, updatedData),
    onSuccess: () => {
      // Invalidamos las queries para refrescar los datos en toda la app
      queryClient.invalidateQueries({ queryKey: ['availabilities'] });
      queryClient.invalidateQueries({ queryKey: ['availability', availabilityId] });
      onFinished(); // Cerramos el modal
    },
    onError: (error) => {
      console.error("Error al actualizar:", error);
      // Aquí podrías mostrar una notificación de error
    }
  });

  // Manejador para los cambios en los inputs
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prevState => ({ ...prevState, [name]: value }));
  };

  // Manejador para el envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // --- ¡AQUÍ ESTÁ LA SOLUCIÓN! ---
    // Creamos un nuevo objeto (`payload`) transformando los valores de string a number
    const payload = {
      id_week: parseInt(formState.id_week, 10),
      id_from_hour: parseInt(formState.id_from_hour, 10),
      id_until_hour: parseInt(formState.id_until_hour, 10),
    };

    updateMutation.mutate(payload); // Enviamos el objeto con los tipos correctos
  };

  const isLoading = isLoadingAvailability || isLoadingWeeks || isLoadingHours;

  // El JSX del formulario y el modal
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-bold text-white mb-4">Editar Disponibilidad</h2>
        
        {isLoading ? (
          <p>Cargando datos del formulario...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="id_week" className="block text-sm font-medium text-gray-300 mb-1">Día</label>
                <select
                  id="id_week"
                  name="id_week"
                  value={formState.id_week}
                  onChange={handleChange}
                  className="w-full bg-gray-700 border-gray-600 text-white rounded-md p-2"
                >
                  {weeks?.map((week: any) => (
                    <option key={week.id_week} value={week.id_week}>{week.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="id_from_hour" className="block text-sm font-medium text-gray-300 mb-1">Hora desde</label>
                <select
                  id="id_from_hour"
                  name="id_from_hour"
                  value={formState.id_from_hour}
                  onChange={handleChange}
                  className="w-full bg-gray-700 border-gray-600 text-white rounded-md p-2"
                >
                  {hours?.map((hour: any) => (
                    <option key={hour.id_hour} value={hour.id_hour}>{hour.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="id_until_hour" className="block text-sm font-medium text-gray-300 mb-1">Hora hasta</label>
                <select
                  id="id_until_hour"
                  name="id_until_hour"
                  value={formState.id_until_hour}
                  onChange={handleChange}
                  className="w-full bg-gray-700 border-gray-600 text-white rounded-md p-2"
                >
                  {hours?.map((hour: any) => (
                    <option key={hour.id_hour} value={hour.id_hour}>{hour.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button type="button" onClick={onFinished} variant="secondary">
                Cancelar
              </Button>
              <Button type="submit" variant="primary" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditAvailabilityForm;
