'use client';

import { useState, useEffect } from "react";
import { getProfessions } from "@/service/professionsService";
import { getTypePetitions } from "@/service/typePetitionsService";
import { getTypeProviders } from "@/service/typeProviderService";
import { Profession, TypePetition, TypeProvider } from "@/WebApiResponse/api";

import Link from 'next/link';

export default function PetitionPage() {
    const [professions, setProfessions] = useState<Profession[]>([]);
    const [typePetitions, setTypePetitions] = useState<TypePetition[]>([]);
    const [typeProviders, setTypeProviders] = useState<TypeProvider[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            setError(null);

            const [professionsResponse, typePetitionsResponse, typeProvidersResponse] = await Promise.all([
                getProfessions(),
                getTypePetitions(),
                getTypeProviders()
            ]);

            if (professionsResponse.error) {
                setError(professionsResponse.error);
                setLoading(false);
                return;
            }
            if (typePetitionsResponse.error) {
                setError(typePetitionsResponse.error);
                setLoading(false);
                return;
            }
            if (typeProvidersResponse.error) {
                setError(typeProvidersResponse.error);
                setLoading(false);
                return;
            }

            setProfessions(professionsResponse.data || []);
            setTypePetitions(typePetitionsResponse.data || []);
            setTypeProviders(typeProvidersResponse.data || []);
            setLoading(false);
        }

        fetchData();
    }, []);

    if (loading) {
        return <div className="p-8">Cargando datos...</div>;
    }

    if (error) {
        return <div className="p-8 text-red-500">Error al cargar los datos: {error}</div>;
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Peticiones</h1>
                <Link href="/petition/create">
                    <button className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors">
                        + Crear Nueva Petición
                    </button>
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
