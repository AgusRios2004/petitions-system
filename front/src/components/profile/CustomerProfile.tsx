'use client';

import React, { useState } from 'react';
import { UserProfile } from '@/types/common'; // Importamos UserProfile desde common.ts

// Importaciones de componentes existentes
import CustomerPetitions from '@/components/petitions/CustomerPetitions';

// Importaciones de los nuevos componentes que hemos creado
import CustomerInfo from './customer/CustomerInfo';
import CustomerHistory from './customer/CustomerHistory';

// --- COMPONENTE DE PERFIL DE CLIENTE (CON LÓGICA DE PETICIONES INTEGRADA) ---
const CustomerProfile = ({ user }: { user: UserProfile }) => {
  const [activeTab, setActiveTab] = useState('peticiones');

  const customerTabs = [
    { id: 'peticiones', label: 'Mis Peticiones' },
    { id: 'informacion', label: 'Información Personal' },
    { id: 'historial', label: 'Historial y Calificaciones' },
  ];

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
        {activeTab === 'peticiones' && user.customer ? (
          <CustomerPetitions customerId={user.customer.id_customer} />
        ) : activeTab === 'informacion' ? (
          <CustomerInfo user={user} /> // Usamos el nuevo componente
        ) : activeTab === 'historial' ? (
          <CustomerHistory user={user} /> // Usamos el nuevo componente
        ) : null}
      </div>
    </div>
  );
};

export default CustomerProfile;
