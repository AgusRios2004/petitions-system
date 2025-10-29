'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { availabilityService } from '@/service/availabilityService';
// Asumimos que tienes o crearás estos servicios para obtener las listas de días y horas
import { weekService } from '@/service/weekService'; 
import { hourService } from '@/service/hourService';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

interface FormState {
  id_week: string;
  id_from_hour: string;
  id_until_hour: string;
  id_user_update: string;
}

interface CreateAvailabilityFormProps {
  onFinished: () => void;
}

const CreateAvailabilityForm: React.FC<CreateAvailabilityFormProps> = ({ onFinished }) => {
    const queryClient = useQueryClient();
    const [formState, setFormState] = useState<FormState>({
        id_week: '',
        id_from_hour: '',
        id_until_hour: '',
        id_user_update: '',
    });

    const {data: weeks, isLoading: isLoadingWeeks} = useQuery({
        queryKey: ['weeks'],
        queryFn: () => weekService.getAllWeeks(), // Asume que este servicio existe
        select: (response) => response.data,
    });

    const {data: hours, isLoading: isLoadingHours} = useQuery({
        queryKey: ['hours'],
        queryFn: () => hourService.getAllHours(), // Asume que este servicio existe
        select: (response) => response.data,
    })

    const createAvailabilityMutation = useMutation({
        mutationFn: (newAvailability: FormState) => {
            return availabilityService.createAvailability(newAvailability);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['availabilities'] });
            toast.success('Disponibilidad creada con éxito.');
            onFinished(); // Cierra el modal al tener éxito
        },
        onError: (error: unknown) => {
            console.error(error);
            toast.error('Error al crear la disponibilidad.');
        }
    });
    const isLoading = isLoadingWeeks || isLoadingHours;

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormState(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!formState.id_week || !formState.id_from_hour || !formState.id_until_hour) {
            toast.error('Por favor, completa todos los campos.');
            return;
        }
        createAvailabilityMutation.mutate(formState);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-xl font-bold text-white mb-4">Crear Nueva Disponibilidad</h2>

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
                                    <option value="">Selecciona un día</option>
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
                                    <option value="">Selecciona una hora</option>
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
                                    <option value="">Selecciona una hora</option>
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
                            <Button type="submit" variant="primary" disabled={createAvailabilityMutation.isPending}>
                                {createAvailabilityMutation.isPending ? 'Creando...' : 'Crear'}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

export default CreateAvailabilityForm;