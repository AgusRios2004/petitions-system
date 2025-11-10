'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { UserProfile, ICustomer } from '@/types/common';
import { customerService } from '@/service/customerService';

import CustomerPetitions from '@/components/petitions/CustomerPetitions';
import CustomerInfo from './customer/CustomerInfo';
import CustomerHistory from './customer/CustomerHistory';

// --- COMPONENTE DE PERFIL DE CLIENTE (CON LÓGICA DE PETICIONES INTEGRADA) ---
const CustomerProfile = ({ user }: { user: UserProfile }) => {
  const [activeTab, setActiveTab] = useState('peticiones');

  const customerId = user.customer?.id_customer;

  const {
    data: detailedCustomer,
    isLoading,
    isError,
    error,
  } = useQuery<ICustomer, Error>({
    queryKey: ['customerProfile', customerId],
    queryFn: ({ queryKey }) => {
      const [, id] = queryKey;
      const customerIdFromKey = id as number; 

      if (typeof customerIdFromKey !== 'number') {
        return Promise.reject(new Error('Customer ID no válido.'));
      }
      return customerService.getCustomerById(customerIdFromKey);
    },
    enabled: !!customerId,
  });

  const customerTabs = [
    { id: 'peticiones', label: 'Mis Peticiones' },
    { id: 'informacion', label: 'Información Personal' },
    { id: 'historial', label: 'Historial y Calificaciones' },
  ];

  const renderTabContent = () => {
    if (activeTab === 'peticiones'){
      return customerId ? <CustomerPetitions customerId={customerId}/> : null;
    }

    if (isLoading) {
      return <p className="text-gray-400">Cargando información del perfil...</p>;
    }

    if (isError) {
      return <p className="text-red-500">Error al cargar el perfil: {error.message}</p>;
    }

    if (detailedCustomer) {
      if (activeTab === 'informacion') {
        return <CustomerInfo customer={detailedCustomer} user={user} />;
      }
      if (activeTab === 'historial') {
        return <CustomerHistory customer={detailedCustomer} />;
      }
    }
  }

  return (
    <div>
      <div className="border-b border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          {customerTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg ${
                activeTab === tab.id
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-white hover:border-gray-300'
              }`}>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="p-6 bg-gray-800 rounded-lg min-h-[400px]">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default CustomerProfile;
