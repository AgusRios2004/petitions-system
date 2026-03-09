'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { FiBriefcase, FiCheckCircle, FiClock, FiStar, FiTrendingUp, FiDollarSign } from 'react-icons/fi';
import { getProviderByIdWithDetails } from '@/service/providerService';
import { useRouter } from 'next/navigation';

interface ProviderDashboardProps {
    providerId: number;
}

const ProviderDashboard: React.FC<ProviderDashboardProps> = ({ providerId }) => {
    const router = useRouter();
    const { data: provider, isLoading } = useQuery({
        queryKey: ['providerProfile', providerId],
        queryFn: () => getProviderByIdWithDetails(providerId),
        enabled: !!providerId,
    });

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-32 bg-gray-800 rounded-2xl" />
                ))}
            </div>
        );
    }

    const postulations = provider?.postulations || [];
    const activePostulations = postulations.filter((p: any) => p.states?.state === 'Pendiente').length;
    const wonPostulations = postulations.filter((p: any) => p.winner).length;

    // Calcular rating promedio
    const averageRating = provider?.grades?.length
        ? (provider.grades.reduce((acc: number, g: any) => acc + g.grades.grade_number, 0) / provider.grades.length).toFixed(1)
        : 'N/A';

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={<FiBriefcase className="text-blue-400" />}
                    label="Postulaciones"
                    value={postulations.length}
                    trend="Total enviado"
                />
                <StatCard
                    icon={<FiCheckCircle className="text-green-400" />}
                    label="Trabajos Ganados"
                    value={wonPostulations}
                    trend="¡Buen trabajo!"
                />
                <StatCard
                    icon={<FiClock className="text-amber-400" />}
                    label="En Espera"
                    value={activePostulations}
                    trend="Pendientes revisión"
                />
                <StatCard
                    icon={<FiStar className="text-yellow-400" />}
                    label="Rating"
                    value={averageRating}
                    trend={`${provider?.grades?.length || 0} reseñas`}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-gray-900/50 rounded-2xl border border-white/5 p-6 backdrop-blur-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <FiTrendingUp className="text-blue-500" />
                            Estado de Postulaciones
                        </h3>
                        <button
                            onClick={() => router.push('/profile?tab=postulaciones')}
                            className="text-xs text-blue-400 hover:underline"
                        >
                            Gestionar todo
                        </button>
                    </div>

                    <div className="space-y-4">
                        {postulations.length > 0 ? (
                            postulations.slice(0, 3).map((post: any, idx: number) => (
                                <div key={idx} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                    <div className="w-10 h-10 rounded-lg bg-green-600/20 flex items-center justify-center text-green-400 font-bold">
                                        <FiDollarSign size={18} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-white truncate">Petición #{post.petition?.id_petition}</p>
                                        <p className="text-xs text-gray-400 truncate">${post.cost} solicitado</p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-black border ${post.winner ? 'bg-green-900/40 text-green-300 border-green-800' : 'bg-gray-800 text-gray-500 border-white/5'
                                            }`}>
                                            {post.winner ? 'Ganador' : post.states?.state}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-gray-500 text-sm mb-4">Aún no te has postulado a ninguna oportunidad.</p>
                                <button
                                    onClick={() => router.push('/profile?tab=oportunidades')}
                                    className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold transition-all"
                                >
                                    Explorar trabajos
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 rounded-2xl border border-indigo-500/20 p-6 backdrop-blur-sm flex flex-col">
                    <h3 className="text-lg font-bold text-white mb-4">Información de Perfil</h3>
                    <div className="space-y-4 flex-1">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400">Profesión</span>
                            <span className="text-white font-bold">{provider?.profession?.name || 'No asignada'}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400">Tipo Proveedor</span>
                            <span className="text-white font-bold">{provider?.typeProvider?.name}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400">Categorías</span>
                            <span className="text-white font-bold">{provider?.providerCategories?.length || 0}</span>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/5">
                        <p className="text-xs text-gray-500 text-center mb-4 italic">Mantén tu disponibilidad actualizada para aparecer en las búsquedas.</p>
                        <button
                            onClick={() => router.push('/profile?tab=disponibilidad')}
                            className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/10"
                        >
                            Gestionar Horarios
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

function StatCard({ icon, label, value, trend }: { icon: React.ReactNode, label: string, value: number | string, trend: string }) {
    return (
        <div className="bg-gray-900/40 border border-white/10 p-5 rounded-2xl backdrop-blur-md hover:border-white/20 transition-all hover:-translate-y-1 group">
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

export default ProviderDashboard;
