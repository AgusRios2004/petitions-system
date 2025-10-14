'use client';

import { useQuery } from "@tanstack/react-query";
import { getProfessions } from "@/service/professionsService";
import { getTypePetitions } from "@/service/typePetitionsService";
import { getTypeProviders } from "@/service/typeProviderService";

import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function PetitionPage() {
    // Usando useQuery para cada llamada a la API
    const { data: professions, isLoading: isLoadingProfessions, isError: isErrorProfessions, error: errorProfessions } = useQuery({
        queryKey: ['professions'],
        queryFn: getProfessions,
    });

    const { data: typePetitions, isLoading: isLoadingTypePetitions, isError: isErrorTypePetitions, error: errorTypePetitions } = useQuery({
        queryKey: ['typePetitions'],
        queryFn: getTypePetitions,
    });

    const { data: typeProviders, isLoading: isLoadingTypeProviders, isError: isErrorTypeProviders, error: errorTypeProviders } = useQuery({
        queryKey: ['typeProviders'],
        queryFn: getTypeProviders,
    });

    // Determinar el estado general de carga y error
    const isLoading = isLoadingProfessions || isLoadingTypePetitions || isLoadingTypeProviders;
    const isError = isErrorProfessions || isErrorTypePetitions || isErrorTypeProviders;
    const error = errorProfessions || errorTypePetitions || errorTypeProviders;

    if (isLoading) {
        return <div className="p-8">Cargando datos...</div>;
    }

    if (isError) {
        return <div className="p-8 text-red-500">Error al cargar los datos: {error?.message || 'Error desconocido'}</div>;
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Peticiones</h1>
                <Link href="/petition/create">
                    <Button fullWidth={false}>+ Crear Nueva Petición</Button>
                </Link>
            </div>
            
            <p className="mb-6 text-gray-600 dark:text-gray-400">Esta es la data cruda que llega de tus servicios para que puedas verificar que todo funciona.</p>
            
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-semibold mb-2">Profesiones:</h2>
                    <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm overflow-x-auto">
                        {JSON.stringify(professions, null, 2)}
                    </pre>
                </div>

                <div>
                    <h2 className="text-2xl font-semibold mb-2">Tipos de Peticiones:</h2>
                    <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm overflow-x-auto">
                        {JSON.stringify(typePetitions, null, 2)}
                    </pre>
                </div>

                <div>
                    <h2 className="text-2xl font-semibold mb-2">Tipos de Proveedores:</h2>
                    <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm overflow-x-auto">
                        {JSON.stringify(typeProviders, null, 2)}
                    </pre>
                </div>
            </div>
        </div>
    );
}