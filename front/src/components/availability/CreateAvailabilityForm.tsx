'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { availabilityService } from '@/service/availabilityService';
// Asumimos que tienes o crearás estos servicios para obtener las listas de días y horas
import { weekService } from '@/service/weekService'; 
import { hourService } from '@/service/hourService';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
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

    // Consultamos TODAS las disponibilidades existentes para validar solapamientos
    const { data: existingAvailabilities } = useQuery({
        queryKey: ['availabilities', 'all'],
        queryFn: () => availabilityService.getAllAvailabilities({}),
        select: (response) => response.data,
    });

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

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!formState.id_week || !formState.id_from_hour || !formState.id_until_hour) {
            toast.error('Por favor, completa todos los campos.');
            return;
        }

        const fromHour = hours?.find(h => h.id_hour === parseInt(formState.id_from_hour));
        const untilHour = hours?.find(h => h.id_hour === parseInt(formState.id_until_hour));

        if (fromHour && untilHour) {
            // Extraer solo la primera parte de la cadena de la hora (ej. "00:00" de "00:00 - 00:30")
            const fromTimeStr = fromHour.name.split(' ')[0];
            const untilTimeStr = untilHour.name.split(' ')[0];

            // Convertir a formato de fecha para comparación
            const fromTime = new Date(`2000/01/01 ${fromTimeStr}`);
            const untilTime = new Date(`2000/01/01 ${untilTimeStr}`);

            if (fromTime >= untilTime) {
                toast.error('La hora "Desde" no puede ser igual o posterior a la hora "Hasta".');
                return;
            }

            // --- VALIDACIÓN DE SOLAPAMIENTO ---
            if (existingAvailabilities) {
                // Función auxiliar para convertir "HH:mm" a minutos
                const getMinutes = (timeStr: string) => {
                    const [h, m] = timeStr.split(':').map(Number);
                    return h * 60 + m;
                };

                const newStart = getMinutes(fromTimeStr);
                const newEnd = getMinutes(untilTimeStr);
                const selectedWeekId = parseInt(formState.id_week);

                const hasOverlap = existingAvailabilities.some((avail: any) => {
                    if (avail.week.id_week !== selectedWeekId) return false; // Solo comparar mismo día
                    const existStart = getMinutes(avail.fromHour.name.split(' ')[0]);
                    const existEnd = getMinutes(avail.untilHour.name.split(' ')[0]);
                    return (newStart < existEnd && newEnd > existStart);
                });

                if (hasOverlap) {
                    toast.error('El horario seleccionado se superpone con una disponibilidad existente.');
                    return;
                }
            }
        } else {
            toast.error('No se pudieron encontrar los detalles de las horas seleccionadas.');
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
                                <Select
                                    label="Día"
                                    id="id_week"
                                    options={weeks?.map((week: any) => ({ value: week.id_week, label: week.name })) || []}
                                    value={formState.id_week ? Number(formState.id_week) : null}
                                    onChange={(val) => setFormState(prev => ({ ...prev, id_week: String(val || '') }))}
                                    placeholder="Selecciona un día"
                                    variant="dark"
                                />
                            </div>

                            <div>
                                <Select
                                    label="Hora desde"
                                    id="id_from_hour"
                                    options={hours?.map((hour: any) => ({ value: hour.id_hour, label: hour.name })) || []}
                                    value={formState.id_from_hour ? Number(formState.id_from_hour) : null}
                                    onChange={(val) => setFormState(prev => ({ ...prev, id_from_hour: String(val || '') }))}
                                    placeholder="Selecciona una hora"
                                    variant="dark"
                                />
                            </div>

                            <div>
                                <Select
                                    label="Hora hasta"
                                    id="id_until_hour"
                                    options={hours?.map((hour: any) => ({ value: hour.id_hour, label: hour.name })) || []}
                                    value={formState.id_until_hour ? Number(formState.id_until_hour) : null}
                                    onChange={(val) => setFormState(prev => ({ ...prev, id_until_hour: String(val || '') }))}
                                    placeholder="Selecciona una hora"
                                    variant="dark"
                                />
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