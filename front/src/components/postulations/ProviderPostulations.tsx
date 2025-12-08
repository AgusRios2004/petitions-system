import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { postulationService } from '@/service/postulationService';
import PostulationList from './PostulationList';
import Tabs from '@/components/ui/Tabs';

interface ProviderPostulationsProps {
  id_provider: number;
}

// El `value` corresponde al `id_state` de la postulación en la base de datos.
const postulationStatusTabs = [
  { label: 'Pendientes', value: 3 },
  { label: 'Ganadoras', value: 1 },
  { label: 'Rechazadas', value: 2 },
  { label: 'Canceladas', value: 6 }, // Postulaciones de peticiones canceladas por el cliente
  { label: 'Dado de baja', value: 4 },
];

const ProviderPostulations: React.FC<ProviderPostulationsProps> = ({ id_provider }) => {
  const [activeTab, setActiveTab] = useState(3);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['postulations', { id_provider, id_state: activeTab }],
    queryFn: () => {
      const params = { id_provider, id_state: activeTab };
      return postulationService.getAllPostulations(params);
    },
    select: (response) => response.data,
    enabled: !!id_provider,
  });

  const handleTabChange = (newTab: number) => {
    setActiveTab(newTab);
  };

  console.log('ProviderPostulations Props:', data)

  return (
    <div>
      <div className="flex justify-start mb-4">
        <Tabs
          tabs={postulationStatusTabs}
          activeTab={activeTab}
          onTabClick={handleTabChange}
        />
      </div>

      {isLoading && <p className="text-center text-gray-400">Cargando postulaciones...</p>}
      {isError && <p className="text-center text-red-500">Error al cargar las postulaciones: {error.message}</p>}
      
      {data && data.length > 0 ? (
        <PostulationList postulations={data} role="provider" />
      ) : (
        <div className="text-center py-10">
          <h3 className="text-xl font-semibold text-white">No hay postulaciones en este estado</h3>
          <p className="text-gray-400 mt-2">Prueba a seleccionar otra pestaña.</p>
        </div>
      )}
    </div>
  );
};

export default ProviderPostulations;