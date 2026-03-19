'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { availabilityService } from '@/service/availabilityService';
import { weekService } from '@/service/weekService';
import { hourService } from '@/service/hourService';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { IAvailability, IWeek, IHour, ApiResponse } from '@/types/common';
import toast from 'react-hot-toast';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

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
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [formState, setFormState] = useState<FormState>({
        id_week: '',
        id_from_hour: '',
        id_until_hour: '',
        id_user_update: '',
    });

    const PRESET_SCHEDULES = [
        { label: '🌅 Mañana', from: '08:00', until: '12:00' },
        { label: '☀️ Tarde', from: '14:00', until: '18:00' },
        { label: '🌙 Noche', from: '19:00', until: '23:00' },
        { label: '🏢 Full Day', from: '08:00', until: '18:00' },
    ];

    const applyPreset = (from: string, until: string) => {
        if (!hours) return;

        // Buscamos el ID de la hora que coincida con el preset
        const fromHour = hours.find(h => h.name.includes(from));
        const untilHour = hours.find(h => h.name.includes(until));

        if (fromHour && untilHour) {
            setFormState(prev => ({
                ...prev,
                id_from_hour: String(fromHour.id_hour),
                id_until_hour: String(untilHour.id_hour),
            }));
            toast.success('Horario aplicado');
        } else {
            toast.error('Este horario no está disponible en la lista');
        }
    };

    const { data: weeks, isLoading: isLoadingWeeks } = useQuery({
        queryKey: ['weeks'],
        queryFn: () => weekService.getAllWeeks(),
        select: (response) => response.data,
    });

    const { data: hours, isLoading: isLoadingHours } = useQuery({
        queryKey: ['hours'],
        queryFn: () => hourService.getAllHours(),
        select: (response) => response.data,
    });

    const { data: existingAvailabilities } = useQuery<ApiResponse<IAvailability[]>, Error, IAvailability[]>({
        queryKey: ['availabilities', 'all', user?.provider?.id_provider],
        queryFn: () => availabilityService.getAllAvailabilities({}),
        select: (response) => response.data || [],
        enabled: !!user?.provider?.id_provider,
    });

    const createAvailabilityMutation = useMutation({
        mutationFn: (newAvailability: FormState) => {
            return availabilityService.createAvailability(newAvailability);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['availabilities'] });
            toast.success('Disponibilidad creada con éxito.');
            onFinished();
        },
        onError: (error: any) => {
            console.error(error);
            const message = error.response?.data?.message || 'Error al crear la disponibilidad.';
            toast.error(message);
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
            const fromTimeStr = fromHour.name.split(' ')[0];
            const untilTimeStr = untilHour.name.split(' ')[0];

            const fromTime = new Date(`2000/01/01 ${fromTimeStr}`);
            const untilTime = new Date(`2000/01/01 ${untilTimeStr}`);

            if (fromTime >= untilTime) {
                toast.error('La hora "Desde" debe ser anterior a la hora "Hasta".');
                return;
            }

            if (existingAvailabilities) {
                const getMinutes = (timeStr: string) => {
                    const [h, m] = timeStr.split(':').map(Number);
                    return h * 60 + (m || 0);
                };

                const newStart = getMinutes(fromTimeStr);
                const newEnd = getMinutes(untilTimeStr);
                const selectedWeekId = parseInt(formState.id_week);

                const hasOverlap = existingAvailabilities.some((avail: IAvailability) => {
                    if (avail.week.id_week !== selectedWeekId) return false;
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-gray-900 border border-gray-700 p-8 rounded-2xl shadow-2xl w-full max-w-lg transform transition-all">
                <div className="flex flex-col items-center justify-center mb-8 text-center pt-4">
                    <div className="p-4 bg-blue-600/10 rounded-2xl mb-4 ring-1 ring-blue-500/20">
                        <Clock className="w-8 h-8 text-blue-500" />
                    </div>
                    <h2 className="text-xl font-black text-white uppercase tracking-widest">Crear Nuevo Horario</h2>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        <p className="text-gray-400 animate-pulse">Cargando datos...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div className="relative">
                                <Select
                                    label="Día de la semana"
                                    id="id_week"
                                    options={weeks?.map((week: IWeek) => ({ value: week.id_week, label: week.name })) || []}
                                    value={formState.id_week ? Number(formState.id_week) : null}
                                    onChange={(val) => setFormState(prev => ({ ...prev, id_week: String(val || '') }))}
                                    placeholder="Selecciona un día"
                                    variant="dark"
                                />
                                <div className="absolute right-3 top-9 text-gray-500 pointer-events-none">
                                    <Calendar className="w-4 h-4" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider ml-1">Horarios Sugeridos</p>
                                <div className="flex flex-wrap gap-2">
                                    {PRESET_SCHEDULES.map((preset) => (
                                        <button
                                            key={preset.label}
                                            type="button"
                                            onClick={() => applyPreset(preset.from, preset.until)}
                                            className="px-3 py-1.5 bg-gray-800 hover:bg-blue-600/30 border border-gray-700 hover:border-blue-500/50 rounded-lg text-xs font-medium text-gray-300 hover:text-blue-400 transition-all active:scale-95"
                                        >
                                            {preset.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="relative">
                                    <Select
                                        label="Hora desde"
                                        id="id_from_hour"
                                        options={hours?.map((hour: IHour) => ({ value: hour.id_hour, label: hour.name })) || []}
                                        value={formState.id_from_hour ? Number(formState.id_from_hour) : null}
                                        onChange={(val) => setFormState(prev => ({ ...prev, id_from_hour: String(val || '') }))}
                                        placeholder="08:00"
                                        variant="dark"
                                    />
                                    <div className="absolute right-3 top-9 text-gray-500 pointer-events-none">
                                        <Clock className="w-4 h-4" />
                                    </div>
                                </div>

                                <div className="relative">
                                    <Select
                                        label="Hora hasta"
                                        id="id_until_hour"
                                        options={hours?.map((hour: IHour) => ({ value: hour.id_hour, label: hour.name })) || []}
                                        value={formState.id_until_hour ? Number(formState.id_until_hour) : null}
                                        onChange={(val) => setFormState(prev => ({ ...prev, id_until_hour: String(val || '') }))}
                                        placeholder="17:00"
                                        variant="dark"
                                    />
                                    <div className="absolute right-3 top-9 text-gray-500 pointer-events-none">
                                        <Clock className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        </div>


                        <div className="flex gap-4 pt-4">
                            <Button
                                type="button"
                                onClick={onFinished}
                                variant="secondary"
                                className="flex-1 py-3 border-gray-700 hover:bg-gray-800"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={createAvailabilityMutation.isPending}
                                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20"
                            >
                                {createAvailabilityMutation.isPending ? 'Guardando...' : 'Guardar Horario'}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

export default CreateAvailabilityForm;