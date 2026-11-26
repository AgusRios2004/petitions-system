'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { IPostulation, IProviderHistoryItem } from '@/types/common';
import { POSTULATION_FILTER_OPTIONS } from '@/lib/states';
import { postulationService } from '@/service/postulationService';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

const formatDate = (date: string) => new Date(date).toLocaleDateString('es-AR');

const ProviderPostulationsPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const providerId = params.id as string;
  const isOwner = !!user?.provider && user.provider.id_provider.toString() === providerId;
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  // Dueño: sus postulaciones completas, filtradas por estado.
  const owned = useQuery<IPostulation[], Error>({
    queryKey: ['providerPostulations', providerId, selectedStatus],
    queryFn: () => postulationService.getPostulationsByProvider(providerId, selectedStatus),
    enabled: isOwner && !!selectedStatus,
  });

  // Resto: historial público con los campos mínimos (sin propuesta ni costo).
  const history = useQuery<IProviderHistoryItem[], Error>({
    queryKey: ['providerHistory', providerId],
    queryFn: () => postulationService.getProviderHistory(providerId),
    enabled: !isOwner && !!providerId,
  });

  const active = isOwner ? owned : history;
  const { isLoading, isError, error, isFetching } = active;
  const items = active.data;
  const showEmpty = (isOwner ? !!selectedStatus : true) && !isLoading && !isFetching && !isError && (!items || items.length === 0);

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
              {POSTULATION_FILTER_OPTIONS.map((o) => (
                <option key={o.value} value={String(o.value)}>{o.label}</option>
              ))}
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

          {showEmpty && (
            <div className="text-center p-8 bg-gray-700/50 rounded-lg">
              <p className="text-lg">No se encontraron postulaciones para el criterio seleccionado.</p>
            </div>
          )}

          {isOwner && owned.data && owned.data.length > 0 && (
            <div className="grid grid-cols-1 gap-6">
              {owned.data.map((postulation) => (
                <div key={postulation.id_postulation} className="bg-gray-700/90 backdrop-blur-md shadow-lg shadow-black/40 rounded-2xl p-6 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50">
                  <h3 className="text-xl font-semibold mb-2 text-cyan-400">
                    Postulación a: {postulation.petition?.description}
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
                  {postulation.petition && (
                    <Link href={`/petition/${postulation.petition.id_petition}`} className="text-cyan-400 hover:text-cyan-300 underline">
                      Ver Detalles de la Petición
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}

          {!isOwner && history.data && history.data.length > 0 && (
            <div className="grid grid-cols-1 gap-6">
              {history.data.map((item) => (
                <div key={item.id_postulation} className="bg-gray-700/90 backdrop-blur-md shadow-lg shadow-black/40 rounded-2xl p-6 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50">
                  <h3 className="text-xl font-semibold mb-2 text-cyan-400">
                    {item.petition?.description ?? 'Petición no disponible'}
                  </h3>
                  <p className="text-gray-300 mb-2">
                    <strong className="text-white">Estado:</strong> {item.state}
                  </p>
                  <p className="text-gray-300 mb-2">
                    <strong className="text-white">Fecha:</strong> {formatDate(item.date)}
                  </p>
                  {item.petition && (
                    <Link href={`/petition/${item.petition.id_petition}`} className="text-cyan-400 hover:text-cyan-300 underline">
                      Ver Detalles de la Petición
                    </Link>
                  )}
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
