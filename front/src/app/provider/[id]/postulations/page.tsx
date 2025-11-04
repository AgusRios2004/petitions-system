'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { IPostulation } from '@/types/common';
import { postulationService } from '@/service/postulationService';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

const ProviderPostulationsPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const providerId = params.id as string;
  const [isOwner, setIsOwner] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  useEffect(() => {
    if (user && user.provider) {
      setIsOwner(user.provider.id_provider.toString() === providerId);
    }
  }, [user, providerId]);

  useEffect(() => {
    if (!isOwner) {
      // If the viewer is not the owner, automatically set the status to 'Accepted'
      setSelectedStatus('1'); // Backend ID for 'Aceptada' is 1
    }
  }, [isOwner]);

  const { data: postulations, isLoading, isError, error, isFetching } = useQuery<IPostulation[], Error>({
    queryKey: ['providerPostulations', providerId, selectedStatus],
    queryFn: () => postulationService.getPostulationsByProvider(providerId, selectedStatus),
    enabled: !!providerId && !!selectedStatus, // Query runs when providerId and a status are available
  });

  return (
    <div className="min-h-screen bg-gray-800 text-gray-100 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-10 text-center text-white tracking-tight">
          {isOwner ? 'Mi Historial de Postulaciones' : 'Postulaciones Exitosas'}
        </h1>

        {/* Show filter only to the owner */}
        {isOwner && (
          <div className="bg-gray-700/90 backdrop-blur-md shadow-lg shadow-black/40 rounded-2xl p-6 mb-8 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50">
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400 border-b border-cyan-600/40 pb-2">
              Filtrar por Estado
            </h2>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="block w-full p-2 mb-4 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-cyan-500 focus:border-cyan-500"
            >
              <option value="">Selecciona un estado</option>
              <option value="3">Pendiente</option>
              <option value="1">Aceptada</option>
              <option value="2">Rechazada</option>
            </select>
          </div>
        )}

        {/* Display Area */}
        <div className="mt-8">
          {(isLoading || isFetching) && <p>Buscando postulaciones...</p>}

          {isError && <p className="text-red-400">Error al cargar las postulaciones: {error?.message}</p>}

          {isOwner && !selectedStatus && (
            <div className="text-center p-8 bg-gray-700/50 rounded-lg">
              <p className="text-lg">Por favor, selecciona un estado para ver las postulaciones.</p>
            </div>
          )}

          {selectedStatus && !isLoading && !isFetching && !isError && (!postulations || postulations.length === 0) && (
            <div className="text-center p-8 bg-gray-700/50 rounded-lg">
              <p className="text-lg">No se encontraron postulaciones para el criterio seleccionado.</p>
            </div>
          )}

          {postulations && postulations.length > 0 && (
            <div className="grid grid-cols-1 gap-6">
              {postulations.map((postulation) => (
                <div key={postulation.id_postulation} className="bg-gray-700/90 backdrop-blur-md shadow-lg shadow-black/40 rounded-2xl p-6 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50">
                  <h3 className="text-xl font-semibold mb-2 text-cyan-400">
                    Postulación a: {postulation.petition.description}
                  </h3>
                  <p className="text-gray-300 mb-2">
                    <strong className="text-white">Propuesta:</strong> {postulation.proposal}
                  </p>
                  <p className="text-gray-300 mb-2">
                    <strong className="text-white">Costo Ofertado:</strong> ${postulation.cost}
                  </p>
                  <p className="text-gray-300 mb-2">
                    <strong className="text-white">Estado:</strong> {postulation.states.state}
                  </p>
                  <Link href={`/petition/${postulation.petition.id_petition}`} className="text-cyan-400 hover:text-cyan-300 underline">
                    Ver Detalles de la Petición
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8">
          <Button
            onClick={() => router.back()}
            variant="secondary"
            size="md"
            fullWidth={true}
          >
            Volver
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProviderPostulationsPage;
