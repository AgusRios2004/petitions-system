'use client';

import React from 'react';
import { ICustomer } from '@/types/common';
import { FiFileText, FiCheckCircle, FiClock, FiStar, FiTrendingUp } from 'react-icons/fi';

interface CustomerDashboardProps {
    customer: ICustomer;
    setActiveTab: (tab: string) => void;
}

const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ customer, setActiveTab }) => {
    const petitionsCount = customer.petitions?.length || 0;
    const finishedCount = customer.petitions?.filter(p => p.states?.state === 'Finalizada').length || 0;
    const pendingCount = customer.petitions?.filter(p => p.states?.state === 'Pendiente').length || 0;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={<FiFileText className="text-blue-400" />}
                    label="Total Peticiones"
                    value={petitionsCount}
                    trend="+2 esta semana"
                />
                <StatCard
                    icon={<FiCheckCircle className="text-green-400" />}
                    label="Finalizadas"
                    value={finishedCount}
                    trend="80% completado"
                />
                <StatCard
                    icon={<FiClock className="text-amber-400" />}
                    label="Pendientes"
                    value={pendingCount}
                    trend="Requieren atención"
                />
                <StatCard
                    icon={<FiStar className="text-purple-400" />}
                    label="Calificaciones"
                    value={customer.grades?.length || 0}
                    trend="4.8 promedio"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-gray-900/50 rounded-2xl border border-white/5 p-6 backdrop-blur-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <FiTrendingUp className="text-blue-500" />
                            Actividad Reciente
                        </h3>
                        <button
                            onClick={() => setActiveTab('peticiones')}
                            className="text-xs text-blue-400 hover:underline"
                        >
                            Ver todo
                        </button>
                    </div>

                    <div className="space-y-4">
                        {customer.petitions && customer.petitions.length > 0 ? (
                            customer.petitions.slice(0, 3).map((petition, idx) => (
                                <div key={idx} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                    <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center text-blue-400 font-bold">
                                        {idx + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-white truncate">{petition.profession?.name || 'Petición sin título'}</p>
                                        <p className="text-xs text-gray-500 truncate">{petition.description}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-900/40 text-blue-300 border border-blue-800/50 uppercase font-black">
                                            {petition.states?.state}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 text-gray-500 text-sm italic">
                                No hay actividad reciente para mostrar.
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-2xl border border-blue-500/20 p-6 backdrop-blur-sm flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-white mb-2">Completar Perfil</h3>
                        <p className="text-sm text-gray-400 mb-6">Un perfil completo aumenta tus posibilidades de encontrar el profesional ideal.</p>

                        <div className="w-full bg-gray-800 rounded-full h-2 mb-2">
                            <div className="bg-blue-500 h-2 rounded-full w-[75%]" />
                        </div>
                        <p className="text-xs text-blue-400 font-bold">75% Completado</p>
                    </div>

                    <button
                        onClick={() => setActiveTab('informacion')}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-900/40 mt-6"
                    >
                        Mejorar Perfil
                    </button>
                </div>
            </div>
        </div>
    );
};

function StatCard({ icon, label, value, trend }: { icon: React.ReactNode, label: string, value: number | string, trend: string }) {
    return (
        <div className="bg-gray-900/40 border border-white/5 p-5 rounded-2xl backdrop-blur-md hover:border-white/10 transition-all hover:-translate-y-1 group">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-xl bg-white/5 group-hover:scale-110 transition-transform">
                    {icon}
                </div>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{trend}</span>
            </div>
            <p className="text-3xl font-black text-white mb-1">{value}</p>
            <p className="text-xs text-gray-500 font-medium">{label}</p>
        </div>
    );
}

export default CustomerDashboard;
