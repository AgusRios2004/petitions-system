'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { providerService } from '@/service/providerService';
import { IProvider, IAvailability } from '@/types/common';
import AvailabilityCard from '@/components/availability/AvailabilityCard';
import { useAuth } from '@/context/AuthContext'; // Import useAuth
import { Button } from '@/components/ui/Button'; // Import Button component

interface ProviderPublicProfilePageProps {
  providerId?: number;
}

const ProviderPublicProfilePage: React.FC<ProviderPublicProfilePageProps> = ({ providerId: providerIdFromProps }) => {
  const params = useParams();
  const router = useRouter(); // Initialize useRouter
  const { user } = useAuth(); // Get logged-in user

  const providerId = providerIdFromProps?.toString() || (params.id as string);

  const [selectedDay, setSelectedDay] = useState<string>(''); // New state for filter
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (user && user.provider) {
      setIsOwner(user.provider.id_provider.toString() === providerId);
    }
  }, [user, providerId]);

  const { data: provider, isLoading, isError, error } = useQuery<IProvider, Error>({
    queryKey: ['providerPublicProfile', providerId],
    queryFn: () => providerService.getProfilePublicProvider(providerId),
    enabled: !!providerId, // Only run the query if providerId is available
  });

  if (isLoading) {
    return <div>Cargando perfil del proveedor...</div>;
  }

  if (isError) {
    return <div>Error al cargar el perfil del proveedor: {error?.message}</div>;
  }

  if (!provider) {
    return <div>No se encontró el perfil del proveedor.</div>;
  }
  console.log(provider);

  // Filter availabilities based on selectedDay
  const filteredAvailabilities = selectedDay
    ? provider.availabilities?.filter(
        (availability) => availability.week.name.toLowerCase() === selectedDay.toLowerCase()
      )
    : provider.availabilities;

  return (
    <div className="min-h-screen bg-gray-800 text-gray-100 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Título principal */}
        <h1 className="text-4xl font-extrabold mb-10 text-center text-white tracking-tight">
          Perfil Público de {provider.user.name} {provider.user.lastname}
        </h1>

        {/* Botón para ver postulaciones - al principio y a la derecha */}
        <div className="flex justify-end mb-8">
            <a
                href={`/provider/${providerId}/postulations`}
                className="inline-block bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
                Ver Historial de Postulaciones
            </a>
        </div>

        {/* Sección Información Personal */}
        <div className="bg-gray-700/90 backdrop-blur-md shadow-lg shadow-black/40 rounded-2xl p-6 mb-8 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50">
          <h2 className="text-2xl font-semibold mb-4 text-cyan-400 border-b border-cyan-600/40 pb-2">
            Información Personal
          </h2>
          <p><strong>Nombre:</strong> {provider.user.name} {provider.user.lastname}</p>
          <p><strong>Tipo de Proveedor:</strong> {provider.typeProvider.name}</p>
          <p><strong>Profesión:</strong> {provider.profession.name}</p>
          {provider.user.profile_image && (
            <img
              src={provider.user.profile_image}
              alt="Profile"
              className="w-24 h-24 rounded-full mt-4 border-2 border-cyan-600 shadow-md shadow-cyan-900/40"
            />
          )}
        </div>
        {/* Sección Dirección */}
        {provider.address && (
          <div className="bg-gray-700/90 backdrop-blur-md shadow-lg shadow-black/40 rounded-2xl p-6 mb-8 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50">
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400 border-b border-cyan-600/40 pb-2">
              Dirección
            </h2>
            <p><strong>Calle:</strong> {provider.address.street} {provider.address.number}</p>
            {provider.address.floor && <p><strong>Piso:</strong> {provider.address.floor}</p>}
            {provider.address.apartment && <p><strong>Departamento:</strong> {provider.address.apartment}</p>}
            <p><strong>Código Postal:</strong> {provider.address.postal_code}</p>
            <p><strong>Ciudad:</strong> {provider.address.city.name}</p>
          </div>
        )}

        {/* Filtro de Disponibilidad */}
        {provider.availabilities && provider.availabilities.length > 0 && (
          <div className="bg-gray-700/90 backdrop-blur-md shadow-lg shadow-black/40 rounded-2xl p-6 mb-8 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50">
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400 border-b border-cyan-600/40 pb-2">
              Filtrar Disponibilidades
            </h2>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="block w-full p-2 mb-4 text-gray-900 border border-gray-300 rounded-lg bg-gray-400 focus:ring-cyan-500 focus:border-cyan-500"
            >
              <option value="">Todos los días</option>
              <option value="Lunes">Lunes</option>
              <option value="Martes">Martes</option>
              <option value="Miércoles">Miércoles</option>
              <option value="Jueves">Jueves</option>
              <option value="Viernes">Viernes</option>
              <option value="Sábado">Sábado</option>
              <option value="Domingo">Domingo</option>
            </select>
          </div>
        )}

        {/* Disponibilidad (usarás tu componente Card después) */}
      {provider.availabilities && provider.availabilities.length > 0 && (
        <div className="bg-gray-700/90 backdrop-blur-md shadow-lg shadow-black/40 rounded-2xl p-6 mb-8 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50">
          <h2 className="text-2xl font-semibold mb-4 text-cyan-400 border-b border-cyan-600/40 pb-2">
            Disponibildades
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAvailabilities?.map((availability: IAvailability) => ( // Use filteredAvailabilities
              <AvailabilityCard
                key={availability.id_availability}
                availability={availability}
                showControls={false}
              />
            ))}
          </div>
        </div>
      )}

        {/* Categorías */}
        {provider.providerCategories && provider.providerCategories.length > 0 && (
          <div className="bg-gray-700/90 backdrop-blur-md shadow-lg shadow-black/40 rounded-2xl p-6 mb-8 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50">
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400 border-b border-cyan-600/40 pb-2">
              Categorías
            </h2>
            <ul className="list-disc list-inside text-gray-200">
              {provider.providerCategories.map((pc) => (
                <li key={pc.id_provider_category}>{pc.category.name}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Portafolio */}
        {provider.portfolio && provider.portfolio.length > 0 && (
          <div className="bg-gray-700/90 backdrop-blur-md shadow-lg shadow-black/40 rounded-2xl p-6 mb-8 transition hover:-translate-y-1 hover:-shadow-2xl hover:shadow-black/50">
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400 border-b border-cyan-600/40 pb-2">
              Portafolio
            </h2>
            <ul>
              {provider.portfolio.map((item, index) => (
                <li key={index} className="mb-3">
                  <p className="text-gray-300">{item.description}</p>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 underline"
                  >
                    {item.link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Calificaciones */}
        {provider.grades && provider.grades.length > 0 && (
          <div className="bg-gray-700/90 backdrop-blur-md shadow-lg shadow-black/40 rounded-2xl p-6 mb-8 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50">
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400 border-b border-cyan-600/40 pb-2">
              Calificaciones
            </h2>
            <ul>
              {provider.grades.map((grade, index) => (
                <li key={index} className="text-gray-200">⭐ Puntuación: {grade.score}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Conditional Back Button for clients at the bottom */}
        {!isOwner && (
          <div className="mt-8">
            <Button
              onClick={() => router.back()}
              variant="secondary"
              size="md"
              fullWidth={true}
              className="!bg-gray-600 !hover:bg-gray-700 !text-white !font-bold !transition-colors"
            >
              Volver
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderPublicProfilePage;