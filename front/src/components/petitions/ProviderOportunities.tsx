'use client';

import React from "react";
import {useQuery} from '@tanstack/react-query';
import Link from 'next/link';
import { getPetitions } from "@/service/petitionService";
import PetitionCard from "./PetitionCard";

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
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['openPetitions'],
            queryFn: async () => {
                const params = { id_state: 3 }; // Asumiendo 3 es el ID para "Abierta"
                const response = await getPetitions(params); // response aquí es { totalItems, petitions: [...] }
                return response; // Devolvemos el objeto completo
            },
            select: (response) => response?.data.petitions || [], // Usamos 'select' para extraer el array de peticiones
        });
        
        // Ahora 'data' ya será directamente el array de peticiones (o un array vacío)
        const petitions: Petition[] = data || [];
        console.log(petitions)
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
