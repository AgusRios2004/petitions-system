import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { postulationService } from '@/service/postulationService';
import { stateService } from '@/service/stateService';
import PostulationList from './PostulationList';
import Tabs from '@/components/ui/Tabs';
import { IState } from '@/types/common';

interface ProviderPostulationsProps {
  id_provider: number;
}

const ProviderPostulations: React.FC<ProviderPostulationsProps> = ({ id_provider }) => {
  const [activeTab, setActiveTab] = useState<number | undefined>();

  const { data: postulationStatusTabs, isLoading: isLoadingStatus } = useQuery({
    queryKey: ['states'], // Clave genérica para aprovechar caché en toda la app
    queryFn: () => stateService.getAllStates(),
    select: (response) => {
      return response.data?.map((state: IState) => ({
        label: state.state,
        value: state.id_state,
      })) || [];
    },
  });

  // Efecto para establecer la pestaña activa una vez que los estados se han cargado
  useEffect(() => {
    if (postulationStatusTabs && postulationStatusTabs.length > 0 && activeTab === undefined) {
      // Por defecto seleccionamos 'Pendientes' (id 3) si existe, si no, la primera de la lista. Se añade el tipo para 'tab'.
      const pendingTab = postulationStatusTabs.find((tab: { value: number }) => tab.value === 3);
      setActiveTab(pendingTab ? pendingTab.value : postulationStatusTabs[0].value);
    }
  }, [postulationStatusTabs, activeTab]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['postulations', { id_provider, id_state: activeTab }],
    queryFn: () => {
      if (activeTab === undefined) {
        // No ejecutar la consulta si no hay una pestaña activa
        return Promise.resolve({ data: [] });
      }
      const params = { id_provider, id_state: activeTab };
      return postulationService.getAllPostulations(params);
    },
    select: (response) => response.data,
    // Habilitar la consulta solo cuando id_provider y activeTab tienen un valor. [5, 10]
    enabled: !!id_provider && activeTab !== undefined,
  });

  const handleTabChange = (newTab: number) => {
    setActiveTab(newTab);
  };

  return (
    <div>
      <div className="flex justify-start mb-4">
        {isLoadingStatus ? (
          <p className="text-center text-gray-400">Cargando estados...</p>
        ) : postulationStatusTabs && activeTab !== undefined ? (
          <Tabs
            tabs={postulationStatusTabs}
            activeTab={activeTab}
            onTabClick={handleTabChange}
          />
        ) : null}
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