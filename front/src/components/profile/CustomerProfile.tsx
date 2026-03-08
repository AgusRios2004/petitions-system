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
import { FiStar } from 'react-icons/fi';
import { SOCKET_URL } from '@/service/socketService';

import CustomerDashboard from './customer/CustomerDashboard';

// --- COMPONENTE DE PERFIL DE CLIENTE (CON LÓGICA DE PETICIONES INTEGRADA) ---
const CustomerProfile = ({ user }: { user: UserProfile }) => {
  const [activeTab, setActiveTab] = useState('dashboard');

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

  const customerTabs = [
    { id: 'dashboard', label: 'Resumen' },
    { id: 'peticiones', label: 'Mis Peticiones' },
    { id: 'ofertas', label: 'Explorar Ofertas' },
    { id: 'informacion', label: 'Info Personal' },
    { id: 'historial', label: 'Mi Historial' },
  ];

  const renderTabContent = () => {
    if (activeTab === 'dashboard' && detailedCustomer) {
      return <CustomerDashboard customer={detailedCustomer} />;
    }

    if (activeTab === 'peticiones') {
      return customerId ? <CustomerPetitions customerId={customerId} /> : null;
    }

    if (activeTab === 'ofertas') {
      return <CustomerOffers customer={detailedCustomer} />;
    }

    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center p-20 animate-pulse text-center">
          <div className="w-16 h-16 bg-gray-700 rounded-full mb-4 mx-auto" />
          <p className="text-gray-400 font-bold">Cargando información del perfil...</p>
        </div>
      );
    }

    if (isError) {
      return (
        <div className="p-8 bg-red-900/10 border border-red-900/20 rounded-2xl text-center">
          <p className="text-red-500 font-bold mb-2">Error al cargar el perfil</p>
          <p className="text-xs text-red-700">{error.message}</p>
        </div>
      );
    }

    if (detailedCustomer) {
      if (activeTab === 'informacion') {
        return <CustomerInfo customer={detailedCustomer} user={user} />;
      }
      if (activeTab === 'historial') {
        return (
          <div className="space-y-8">
            <CustomerHistory customer={detailedCustomer} />

            <div className="border-t border-white/5 pt-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <FiStar className="text-yellow-400" />
                Calificaciones Realizadas
              </h3>
              {isLoadingGrades ? (
                <p className="text-gray-400">Cargando historial de calificaciones...</p>
              ) : givenGrades && givenGrades.length > 0 ? (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                  {givenGrades.map((grade: IGrade) => (
                    <div key={grade.id_grade} className="bg-gray-700/30 p-5 rounded-2xl border border-white/5 hover:bg-gray-700/50 transition-all hover:-translate-y-1">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-blue-400 font-black text-xs uppercase tracking-widest mb-1">
                            A: {grade.provider
                              ? `${grade.provider.user.name} ${grade.provider.user.lastname}`
                              : grade.customer
                                ? `${grade.customer.user.name} ${grade.customer.user.lastname}`
                                : 'Usuario'}
                          </p>
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight italic">{new Date(grade.date_create).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center bg-yellow-500/10 px-3 py-1 rounded-full text-yellow-500 font-black text-xs border border-yellow-500/20 shadow-sm shadow-yellow-950/20">
                          ★ {grade.grade_number}
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm italic leading-relaxed font-medium">&quot;{grade.comment}&quot;</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center bg-gray-900/50 rounded-2xl border border-dashed border-white/10">
                  <FiStar className="mx-auto text-gray-700 mb-4" size={40} />
                  <p className="text-gray-400 font-medium italic">No has realizado ninguna calificación todavía.</p>
                </div>
              )}
            </div>
          </div>
        );
      }
    }
  }

  return (
    <div className="space-y-8">
      <div className="w-full overflow-x-auto scrollbar-hide py-1">
        <nav className="flex items-center gap-1.5 p-1.5 bg-gray-950/40 backdrop-blur-md rounded-2xl border border-white/5 w-fit min-w-max mx-auto sm:mx-0" aria-label="Tabs">
          {customerTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-2.5 px-6 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300 active:scale-95 ${activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40 ring-2 ring-blue-500/20'
                : 'text-gray-500 hover:text-white hover:bg-white/5'
                }`}>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="p-0 sm:p-2 bg-transparent min-h-[400px]">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default CustomerProfile;
