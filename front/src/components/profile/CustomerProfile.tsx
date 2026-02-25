'use client';

import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQuery } from '@tanstack/react-query';
import toast, { Toaster } from 'react-hot-toast'; // 1. Importamos toast y Toaster
import { UserProfile, ICustomer, IPostulation, IGrade } from '@/types/common'; // 2. Importamos IPostulation
import { customerService } from '@/service/customerService';
import { gradeService } from '@/service/gradeService';

import CustomerPetitions from '@/components/petitions/CustomerPetitions';
import CustomerInfo from './customer/CustomerInfo';
import CustomerHistory from './customer/CustomerHistory';
import CustomerOffers from './customer/CustomerOffers';

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

  // Consulta para obtener las calificaciones hechas por el cliente
  const { data: givenGrades, isLoading: isLoadingGrades } = useQuery({
    queryKey: ['givenGrades', user.id_user],
    queryFn: async () => {
      return await gradeService.getGrades({ id_user_create: user.id_user });
    },
    enabled: activeTab === 'historial' && !!user.id_user,
  });

  useEffect(() => {
    // --- LÓGICA DE CONEXIÓN DE SOCKET ---
    const token = localStorage.getItem('accessToken');
    console.log('Intentando conectar socket. Token encontrado:', !!token); // <-- Añadido para depurar
    if (!token) return; // No intentar conectar si no hay token

    // Conecta al backend, enviando el token para la autenticación
    const socket: Socket = io('http://localhost:3000', {
      auth: {
        token: token,
      },
    });

    socket.on('connect', () => {
      console.log('✅ Conectado al servidor de sockets con ID:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('❌ Desconectado del servidor de sockets.');
    });

    // Limpieza: desconectar el socket cuando el componente se desmonte
    return () => {
      socket.disconnect();
    };
  }, []); // Se ejecuta una vez cuando el componente se monta

  const customerTabs = [
    { id: 'peticiones', label: 'Mis Peticiones' },
    { id: 'ofertas', label: 'Explorar Ofertas' },
    { id: 'informacion', label: 'Información Personal' },
    { id: 'historial', label: 'Historial y Calificaciones' },
  ];

  const renderTabContent = () => {
    if (activeTab === 'peticiones') {
      return customerId ? <CustomerPetitions customerId={customerId} /> : null;
    }

    if (activeTab === 'ofertas') {
      return <CustomerOffers customer={detailedCustomer} />;
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
        return (
          <div className="space-y-8">
            <CustomerHistory customer={detailedCustomer} />

            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-xl font-bold text-white mb-4">Calificaciones Realizadas</h3>
              {isLoadingGrades ? (
                <p className="text-gray-400">Cargando historial de calificaciones...</p>
              ) : givenGrades && givenGrades.length > 0 ? (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                  {givenGrades.map((grade: IGrade) => (
                    <div key={grade.id_grade} className="bg-gray-700/30 p-4 rounded-lg border border-gray-600 hover:bg-gray-700/50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-cyan-400 font-semibold text-sm uppercase tracking-wide">
                            A: {grade.provider
                              ? `${grade.provider.user.name} ${grade.provider.user.lastname}`
                              : grade.customer
                                ? `${grade.customer.user.name} ${grade.customer.user.lastname}`
                                : 'Usuario'}
                          </p>
                          <p className="text-xs text-gray-500">{new Date(grade.date_create).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center bg-gray-800 px-2 py-1 rounded text-yellow-400 font-bold text-sm">
                          ★ {grade.grade_number}
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm italic">&quot;{grade.comment}&quot;</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No has realizado ninguna calificación todavía.</p>
              )}
            </div>
          </div>
        );
      }
    }
  }

  return (
    <div>
      <Toaster
        position="top-right"
        toastOptions={{ className: 'bg-gray-700 text-white' }}
      />
      <div className="border-b border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          {customerTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg ${activeTab === tab.id
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
