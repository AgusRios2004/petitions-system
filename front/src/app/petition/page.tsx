'use client';

import { useState, useEffect } from "react";
import { getProfessions } from "@/service/professionsService";
import { getTypePetitions } from "@/service/typePetitionsService";
import { getTypeProviders } from "@/service/typeProviderService";
import { Profession, TypePetition, TypeProvider } from "@/WebApiResponse/api";

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
        return <div>Cargando datos...</div>;
    }

    if (error) {
        return <div style={{ color: 'red' }}>Error al cargar los datos: {error}</div>;
    }

    return (
        <div>
            <h1>Datos Recibidos de la API</h1>
            <p>Esta es la data cruda que llega de tus servicios para que puedas verificar que todo funciona.</p>
            
            <h2>Profesiones:</h2>
            <pre style={{ background: '#f4f4f4', padding: '10px', borderRadius: '5px' }}>
                {JSON.stringify(professions, null, 2)}
            </pre>

            <h2>Tipos de Peticiones:</h2>
            <pre style={{ background: '#f4f4f4', padding: '10px', borderRadius: '5px' }}>
                {JSON.stringify(typePetitions, null, 2)}
            </pre>

            <h2>Tipos de Proveedores:</h2>
            <pre style={{ background: '#f4f4f4', padding: '10px', borderRadius: '5px' }}>
                {JSON.stringify(typeProviders, null, 2)}
            </pre>
        </div>
    );
}
