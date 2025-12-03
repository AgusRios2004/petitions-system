'use client';

import React from "react";
import {useQuery} from '@tanstack/react-query';
import Link from 'next/link';
import { getPetitions } from "@/service/petitionService";
import { postulationService } from "@/service/postulationService";
import PetitionCard from "./PetitionCard";
import { useAuth } from '@/context/AuthContext';

interface Petition {
  id_petition: number;
  description: string;
  date_create: string;
  date_since: string;
  date_until: string;
  states: {
    state: string;
  };
  typePetitions: {
    name: string;
  };
}

const ProviderOportunities = () => {
    const { user } = useAuth();
    const providerId = user?.provider?.id_provider;

    const { data: postulationsData, isLoading: isLoadingPostulations } = useQuery({
        queryKey: ['providerPostulations', providerId],
        queryFn: async () => {
            if (!providerId) return [];
            const response = await postulationService.getAllPostulations({ id_provider: providerId });
            return response.data;
        },
        enabled: !!providerId,
        select: (response) => response || [],
    });

    const postulatedPetitionIds = new Set(postulationsData?.map((postulation: any) => postulation.id_petition));

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['openPetitions'],
        queryFn: async () => {
            const params: { id_state: number; providerId?: number } = { 
                id_state: 3 // Asumiendo 3 es el ID para "Abierta"
            };
            // Añadimos el providerId a los parámetros si existe
            if (providerId) params.providerId = providerId;
            const response = await getPetitions(params);
            return response;
        },
        select: (response) => {
            const allPetitions = response?.data.petitions || [];
            if (postulatedPetitionIds.size > 0) {
                return allPetitions.filter((petition: Petition) => !postulatedPetitionIds.has(petition.id_petition));
            }
            return allPetitions;
        },
    });
        
        // Ahora 'data' ya será directamente el array de peticiones (o un array vacío)
            const petitions: Petition[] = data || [];
        
            if (isLoading || isLoadingPostulations) {
                return <p className="text-white text-center">Cargando oportunidades...</p>;
            }
        
            if (isError || error || (user?.provider && !providerId)) { // Check if user is a provider but providerId is missing
                return <p className="text-red-500 text-center">Error al cargar las oportunidades o postulaciones.</p>;
            }

            return (
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white mb-4">Oportunidades Disponibles</h2>
                    {petitions.length === 0 ? (
                        <p className="text-white text-center">No hay peticiones abiertas en este momento.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {petitions.map((petition) => (
                                <PetitionCard key={petition.id_petition} petition={petition} />
                            ))}
                        </div>
                    )}
                </div>
            );
        };

export default ProviderOportunities;
