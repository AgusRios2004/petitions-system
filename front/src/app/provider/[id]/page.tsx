'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { providerService } from '@/service/providerService';
import { IProvider, IAvailability } from '@/types/common';

const ProviderPublicProfilePage: React.FC = () => {
  const params = useParams();
  const providerId = params.id as string;

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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Perfil Público de {provider.user.name} {provider.user.lastname}</h1>

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-3">Información Personal</h2>
        <p><strong>Nombre:</strong> {provider.user.name} {provider.user.lastname}</p>
        <p><strong>Tipo de Proveedor:</strong> {provider.typeProvider.name}</p>
        <p><strong>Profesión:</strong> {provider.profession.name}</p>
        {provider.user.profile_image && (
          <img src={provider.user.profile_image} alt="Profile" className="w-24 h-24 rounded-full mt-4" />
        )}
      </div>

      {provider.address && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-3">Dirección</h2>
          <p><strong>Calle:</strong> {provider.address.street} {provider.address.number}</p>
          {provider.address.floor && <p><strong>Piso:</strong> {provider.address.floor}</p>}
          {provider.address.apartment && <p><strong>Departamento:</strong> {provider.address.apartment}</p>}
          <p><strong>Código Postal:</strong> {provider.address.postal_code}</p>
          <p><strong>Ciudad:</strong> {provider.address.city.name}</p>
        </div>
      )}

      {provider.availabilities && provider.availabilities.length > 0 && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-3">Disponibilidad</h2>
          {provider.availabilities.map((availability: IAvailability) => (
            <div key={availability.id_availability} className="mb-2 p-3 border rounded-md">
              <p><strong>Día:</strong> {availability.week.name}</p>
              <p><strong>Desde:</strong> {availability.fromHour.name}</p>
              <p><strong>Hasta:</strong> {availability.untilHour.name}</p>
            </div>
          ))}
        </div>
      )}

      {provider.providerCategories && provider.providerCategories.length > 0 && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-3">Categorías</h2>
          <ul>
            {provider.providerCategories.map((pc) => (
              <li key={pc.id_provider_category}>{pc.category.name}</li>
            ))}
          </ul>
        </div>
      )}

      {provider.portfolio && provider.portfolio.length > 0 && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-3">Portafolio</h2>
          <ul>
            {provider.portfolio.map((item, index) => (
              <li key={index}>
                <p>{item.description}</p>
                <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{item.link}</a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {provider.grades && provider.grades.length > 0 && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-3">Calificaciones</h2>
          <ul>
            {provider.grades.map((grade, index) => (
              <li key={index}>Puntuación: {grade.score}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProviderPublicProfilePage;