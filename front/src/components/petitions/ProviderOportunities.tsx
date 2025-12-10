'use client';

import React, { useState, useMemo } from "react";
import {useQuery} from '@tanstack/react-query';
import Link from 'next/link';
import { getPetitions } from "@/service/petitionService";
import { Button } from "@/components/ui/Button";
import PetitionCard from "./PetitionCard";
import { IPetitionCardData } from "@/types/common";
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
    const providerTypeId = user?.provider?.id_type_provider;

    const [filterByMyType, setFilterByMyType] = useState(false);

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['openPetitions', providerId], // Agregamos providerId a la key para que refresque si cambia
        queryFn: async () => {
            const params: { id_state: number; providerId?: number; excludeAppliedByProviderId?: number } = { 
                id_state: 3 // Asumiendo 3 es el ID para "Abierta"
            };
            // Añadimos el providerId a los parámetros si existe
            if (providerId) {
                params.providerId = providerId; // Para filtrar por intereses
                params.excludeAppliedByProviderId = providerId; // Para excluir las ya postuladas
            }
            const response = await getPetitions(params);
            return response;
        },
        enabled: !!providerId,
        select: (response) => response?.data.petitions || [],
    });

    // Aplicamos el filtro opcional sobre los datos ya filtrados por postulación
    const petitions = useMemo(() => {
        const availablePetitions = data || [];
        if (filterByMyType && providerTypeId) {
            return availablePetitions.filter((p: PetitionForProvider) => p.id_type_provider === providerTypeId);
        }
        return availablePetitions;
    }, [data, filterByMyType, providerTypeId]);
        
    if (isLoading) {
        return <p className="text-white text-center">Cargando oportunidades...</p>;
    }

    if (isError || error || (user?.provider && !providerId)) { // Check if user is a provider but providerId is missing
        return <p className="text-red-500 text-center">Error al cargar las oportunidades o postulaciones.</p>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
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
                {petitions.length === 0 ? (
                    <p className="text-white text-center">{filterByMyType ? 'No hay peticiones que coincidan con tu tipo de proveedor.' : 'No hay peticiones abiertas en este momento.'}</p>
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
