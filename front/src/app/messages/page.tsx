'use client';

import { useState } from 'react';
import ConversationList from '@/components/message/ConversationList';
import ChatView from '@/components/message/ChatView';
import { MessageSquare, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function MessagesPage() {
    const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);

    const handleSelectConversation = (id: number) => {
        setSelectedConversationId(id);
    };

    const handleBackToList = () => {
        setSelectedConversationId(null);
    };

    return (
        <main className="h-[calc(100vh-80px)] bg-gray-950 flex overflow-hidden">
            {/* Sidebar - Hidden on mobile when a conversation is selected */}
            <div className={`w-full lg:w-[400px] border-r border-white/5 bg-gray-900/40 backdrop-blur-3xl transition-all duration-300 ${selectedConversationId ? 'hidden lg:block' : 'block'
                }`}>
                <ConversationList
                    selectedId={selectedConversationId || undefined}
                    onSelect={handleSelectConversation}
                />
            </div>

            {/* Chat Area - Full screen on mobile when a conversation is selected */}
            <div className={`flex-1 flex flex-col bg-gray-950/20 transition-all duration-300 ${!selectedConversationId ? 'hidden lg:flex' : 'flex'
                }`}>
                {selectedConversationId ? (
                    <div className="flex-1 flex flex-col min-h-0">
                        {/* Mobile-only header to return to list */}
                        <div className="lg:hidden p-4 border-b border-white/5 bg-gray-950/80 backdrop-blur-md flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleBackToList}
                                className="h-10 w-10 rounded-xl bg-white/5 text-white hover:bg-white/10 border-none"
                            >
                                <ArrowLeft size={18} />
                            </Button>
                            <h3 className="font-bold text-white uppercase tracking-widest text-sm">Volver a Chats</h3>
                        </div>

                        <div className="flex-1 overflow-hidden">
                            <ChatView conversationId={selectedConversationId} hideBack={true} />
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center animate-in fade-in zoom-in duration-500">
                        <div className="relative mb-8">
                            <div className="absolute inset-0 bg-blue-600 blur-3xl opacity-20 rounded-full scale-150 animate-pulse" />
                            <div className="relative w-24 h-24 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-900/40 transform rotate-12 hover:rotate-0 transition-transform duration-500">
                                <MessageSquare size={44} className="text-white" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tight">Tus Mensajes</h2>
                        <p className="text-gray-500 max-w-sm mx-auto leading-relaxed text-sm font-medium">
                            Selecciona una conversación de la lista para leer y responder mensajes en tiempo real.
                        </p>
                        <div className="mt-8 flex gap-3">
                            <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.3s]" />
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.15s]" />
                            <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" />
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
