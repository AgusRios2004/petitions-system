'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getProfilePublicProvider } from '@/service/providerService';
import { IProvider, IAvailability } from '@/types/common';
import AvailabilityCard from '@/components/availability/AvailabilityCard';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';

interface PublicProfileContentProps {
  providerId: number;
}

const PublicProfileContent: React.FC<PublicProfileContentProps> = ({ providerId }) => {
  const router = useRouter();
  const { user } = useAuth();

  const [selectedDay, setSelectedDay] = useState<string>('');
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (user && user.provider) {
      setIsOwner(user.provider.id_provider.toString() === providerId.toString());
    }
  }, [user, providerId]);

  const { data: provider, isLoading, isError, error } = useQuery<IProvider, Error>({
    queryKey: ['providerPublicProfile', providerId],
    queryFn: () => getProfilePublicProvider(providerId.toString()),
    enabled: !!providerId,
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

  const filteredAvailabilities = selectedDay
    ? provider.availabilities?.filter(
        (availability) => availability.week.name.toLowerCase() === selectedDay.toLowerCase()
      )
    : provider.availabilities;

  return (
    <div className="min-h-screen bg-gray-800 text-gray-100 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-10 text-center text-white tracking-tight">
          Perfil Público de {provider.user.name} {provider.user.lastname}
        </h1>

        <div className="flex justify-end items-center gap-4 mb-8">
            {isOwner && (
                <Button
                    onClick={() => router.push('/profile/edit')}
                    className="!bg-blue-600 !hover:bg-blue-700"
                >
                    Editar Perfil
                </Button>
            )}
            <a
                href={`/provider/${providerId}/postulations`}
                className="inline-block bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
                Ver Historial de Postulaciones
            </a>
        </div>

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

      {provider.availabilities && provider.availabilities.length > 0 && (
        <div className="bg-gray-700/90 backdrop-blur-md shadow-lg shadow-black/40 rounded-2xl p-6 mb-8 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50">
          <h2 className="text-2xl font-semibold mb-4 text-cyan-400 border-b border-cyan-600/40 pb-2">
            Disponibildades
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAvailabilities?.map((availability: IAvailability) => (
              <AvailabilityCard
                key={availability.id_availability}
                availability={availability}
                showControls={false}
              />
            ))}
          </div>
        </div>
      )}

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

export default PublicProfileContent;
