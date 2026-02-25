'use client';

import React, { useState, useMemo } from "react";
import { useQuery } from '@tanstack/react-query';
import { getPetitions } from "@/service/petitionService";
import { getProfilePublicProvider } from '@/service/providerService';
import { stateService } from "@/service/stateService";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import PetitionCard from "./PetitionCard";
import { IPetitionCardData } from "@/types/common";
import { IState } from "@/types/common";
import { useAuth } from '@/context/AuthContext';

type PetitionForProvider = IPetitionCardData & {
    id_type_provider: number;
    typeProvider: {
        name: string;
    };
};

const ProviderOportunities = () => {
    const { user } = useAuth();
    const providerId = user?.provider?.id_provider;
    const providerTypeId = user?.provider?.typeProvider?.id_type_provider;

    const [filterByMyType, setFilterByMyType] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

    const { data: statesResponse } = useQuery({
        queryKey: ['states'],
        queryFn: () => stateService.getAllStates(),
    });

    const pendingStateId = useMemo(() => {
        return statesResponse?.data?.find((s: IState) => s.state === 'Pendiente')?.id_state;
    }, [statesResponse]);

    // Obtener perfil del proveedor para sacar sus categorías
    const { data: providerProfile } = useQuery({
        queryKey: ['providerPublicProfile', providerId],
        queryFn: () => getProfilePublicProvider(providerId!.toString()),
        enabled: !!providerId,
    });

    const rawCategories = providerProfile?.providerCategories?.map(pc => ({
        value: pc.category.id_category,
        label: pc.category.name
    })) || [];

    const categoryOptions = rawCategories.length > 0
        ? [{ value: 0, label: 'Todas las categorías' }, ...rawCategories]
        : [];

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['openPetitions', providerId, selectedCategoryId, pendingStateId], // Agregamos selectedCategoryId a la key
        queryFn: async () => {
            const params: Record<string, unknown> = {
                id_state: pendingStateId
            };
            // Añadimos el providerId a los parámetros si existe
            if (providerId) {
                params.providerId = providerId; // Para filtrar por mis categorías de proveedor
            }
            if (selectedCategoryId) {
                params.categories = selectedCategoryId;
            }
            const response = await getPetitions(params);
            return response;
        },
        enabled: !!providerId && !!pendingStateId,
        select: (response) => response?.data.petitions || [],
    });

    const petitions = useMemo(() => {
        let availablePetitions = data || [];

        if (selectedCategoryId) {
            availablePetitions = availablePetitions.filter((p: IPetitionCardData) =>
                p.petitionCategories?.some((pc: { category: { id_category: number } }) => pc.category.id_category === selectedCategoryId)
            );
        }

        if (filterByMyType && providerTypeId) {
            return availablePetitions.filter((p: PetitionForProvider) => p.id_type_provider === providerTypeId);
        }
        return availablePetitions;
    }, [data, filterByMyType, providerTypeId, selectedCategoryId]);

    if (isLoading) {
        return <p className="text-white text-center">Cargando oportunidades...</p>;
    }

    if (isError || error || (user?.provider && !providerId)) { // Check if user is a provider but providerId is missing
        return <p className="text-red-500 text-center">Error al cargar las oportunidades o postulaciones.</p>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 mb-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-2xl font-bold text-white">Oportunidades Disponibles</h2>
                    {user?.provider && (
                        <Button
                            onClick={() => setFilterByMyType(prev => !prev)}
                            variant={filterByMyType ? 'primary' : 'secondary'}
                            className="w-full sm:w-auto"
                        >
                            {filterByMyType ? 'Mostrar Todas' : 'Filtrar por mi tipo de proveedor'}
                        </Button>
                    )}
                </div>

                {user?.provider && (
                    <div className="w-full sm:w-72">
                        <Select
                            label="Filtrar por categoría"
                            options={categoryOptions}
                            value={selectedCategoryId || 0}
                            onChange={(val) => setSelectedCategoryId(val ? Number(val) : null)}
                            placeholder={categoryOptions.length > 0 ? "Mis categorías" : "Sin categorías"}
                            disabled={categoryOptions.length === 0}
                        />
                    </div>
                )}
            </div>
            {petitions.length === 0 ? (
                <div className="text-center py-10 bg-gray-800/50 rounded-lg border border-gray-700">
                    <p className="text-gray-400 text-lg">
                        {filterByMyType
                            ? 'No hay peticiones que coincidan con tu tipo de proveedor.'
                            : selectedCategoryId
                                ? 'No hay peticiones para la categoría seleccionada.'
                                : 'No hay peticiones abiertas que coincidan con tus intereses.'}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">Intenta cambiar los filtros.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {petitions.map((petition: PetitionForProvider) => (
                        <PetitionCard key={petition.id_petition} petition={petition} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProviderOportunities;
