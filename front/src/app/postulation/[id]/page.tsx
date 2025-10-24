'use client';
import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { postulationService } from '@/service/postulationService';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { IPostulation } from '@/types/common';

export default function PostulationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postulationId = params.id as string;

  const { data: postulationData, isLoading, error } = useQuery<{ data: IPostulation }>({ 
    queryKey: ['postulation', postulationId],
    queryFn: () => postulationService.getPostulationById(postulationId),
    enabled: !!postulationId,
  });

  if (isLoading) return <p>Cargando detalles de la postulación...</p>;
  if (error) return <p>Error al cargar la postulación: {error.message}</p>;
  if (!postulationData || !postulationData.data) return <p>Postulación no encontrada.</p>;

  const postulation = postulationData.data;
  console.log(postulation)
  return (
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="mb-4">
          <Link href="/profile?tab=postulaciones" className="text-blue-500 hover:underline">
            &larr; Volver a Mis Postulaciones
          </Link>
        </div>
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Detalles de la Postulación</h1>

        <div className="space-y-4">
          <div>
            <p className="text-gray-600 text-sm">Petición:</p>
            <p className="text-lg font-semibold text-gray-900">{postulation.petition.description}</p>
          </div>

          <div>
            <p className="text-gray-600 text-sm">Propuesta:</p>
            <p className="text-gray-800">{postulation.proposal}</p>
          </div>

          <div>
            <p className="text-gray-600 text-sm">Costo Total:</p>
            <p className="text-lg font-semibold text-gray-900">${postulation.cost}</p>
          </div>

          <div>
            <p className="text-gray-600 text-sm">Estado:</p>
            <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
              postulation.states.state === 'Abierta' ? 'bg-green-700 text-green-100' : 'bg-yellow-700 text-yellow-100'
            }`}>
              {postulation.states.state}
            </span>
          </div>

          {postulation.inventories && postulation.inventories.length > 0 && (
            <div>
              <p className="text-gray-600 text-sm mb-2">Artículos:</p>
              <ul className="list-disc list-inside space-y-1">
                {postulation.inventories.map((item: any) => (
                  <li key={item.id_inventory} className="text-gray-800">
                    {item.article.name} - Cantidad: {item.quantity} - Costo: ${item.cost}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <p className="text-gray-600 text-sm">Fecha de Creación:</p>
            <p className="text-gray-800">{new Date(postulation.date_create).toLocaleString()}</p>
          </div>

          {postulation.date_update && (
            <div>
              <p className="text-gray-600 text-sm">Última Actualización:</p>
              <p className="text-gray-800">{new Date(postulation.date_update).toLocaleString()}</p>
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-end">
          <Link href={`/postulation/edit/${postulation.id_postulation}`}>
            <Button variant="primary">Editar Postulación</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
