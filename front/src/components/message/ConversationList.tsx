'use client';

import { useQuery } from '@tanstack/react-query';
import { MessageSquare, Loader2, Search } from 'lucide-react';
import { getConversations } from '@/service/messageService';
import { IConversationPreview } from '@/types/common';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState } from 'react';

interface ConversationListProps {
    selectedId?: number;
    onSelect?: (id: number) => void;
}

export default function ConversationList({ selectedId, onSelect }: ConversationListProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const { data: conversations, isLoading } = useQuery<IConversationPreview[]>({
        queryKey: ['conversations'],
        queryFn: getConversations,
    });

    const filteredConversations = conversations?.filter(convo => {
        const otherUser = convo.users && convo.users.length > 0 ? convo.users[0] : null;
        if (!otherUser) return false;
        const fullName = `${otherUser.name} ${otherUser.lastname}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase());
    });

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8">
                <Loader2 className="animate-spin text-blue-500 mb-4" size={32} />
                <p className="text-gray-400 text-sm font-medium">Cargando conversaciones...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-gray-900/50 backdrop-blur-xl border-r border-white/5">
            <div className="p-6 pb-4">
                <h2 className="text-2xl font-black text-white mb-6 tracking-tight uppercase">Mensajes</h2>
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar conversación..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-800/50 border border-white/5 rounded-2xl py-3 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {filteredConversations && filteredConversations.length > 0 ? (
                    <div className="px-3 space-y-1 pb-6">
                        {filteredConversations.map(convo => {
                            const otherUser = convo.users?.[0];
                            if (!otherUser) return null;
                            const isSelected = selectedId === convo.id_conversation;

                            return (
                                <div
                                    key={convo.id_conversation}
                                    onClick={() => onSelect?.(convo.id_conversation)}
                                    className={`group relative flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-300 ${isSelected
                                            ? 'bg-blue-600 shadow-xl shadow-blue-900/40'
                                            : 'hover:bg-white/5'
                                        }`}
                                >
                                    <div className="relative flex-shrink-0">
                                        <img
                                            src={otherUser.profile_image || '/default-avatar.png'}
                                            alt={`${otherUser.name} ${otherUser.lastname}`}
                                            className={`h-14 w-14 rounded-2xl object-cover border-2 shadow-lg transition-transform group-hover:scale-105 ${isSelected ? 'border-white/20' : 'border-white/5'
                                                }`}
                                        />
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-gray-900 rounded-full" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h4 className={`font-black text-sm truncate uppercase tracking-tight ${isSelected ? 'text-white' : 'text-gray-200 group-hover:text-white'}`}>
                                                {otherUser.name} {otherUser.lastname}
                                            </h4>
                                            {convo.last_message_date && (
                                                <span className={`text-[10px] tabular-nums whitespace-nowrap ml-2 font-medium ${isSelected ? 'text-blue-100' : 'text-gray-500'}`}>
                                                    {formatDistanceToNow(new Date(convo.last_message_date), { addSuffix: false, locale: es })}
                                                </span>
                                            )}
                                        </div>
                                        <p className={`text-xs truncate font-medium ${isSelected ? 'text-blue-50 opacity-80' : 'text-gray-500'}`}>
                                            {convo.last_message_content || 'Sin mensajes aún'}
                                        </p>
                                    </div>

                                    {isSelected && (
                                        <div className="absolute left-0 top-4 bottom-4 w-1 bg-white rounded-r-full" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5 ring-4 ring-gray-900">
                            <MessageSquare size={24} className="text-gray-700" />
                        </div>
                        <h4 className="text-white font-bold mb-1 uppercase text-xs tracking-widest">No hay resultados</h4>
                        <p className="text-gray-500 text-[10px] uppercase font-bold tracking-tighter">Intenta con otro nombre.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
