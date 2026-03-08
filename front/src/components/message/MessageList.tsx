'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Loader2 } from 'lucide-react';
import { getConversations } from '@/service/messageService';
import { IConversationPreview, IMessage } from '@/types/common';
import { useSocket } from '@/context/SocketContext';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export default function MessageList() {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const { user } = useAuth();

  const { data: conversations, isLoading } = useQuery<IConversationPreview[]>({
    queryKey: ['conversations'],
    queryFn: getConversations,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage: IMessage) => {
      console.log('Nuevo mensaje recibido via socket:', newMessage);

      // Actualizamos el caché de 'conversations' manualmente
      queryClient.setQueryData<IConversationPreview[]>(['conversations'], (oldData) => {
        const conversations = oldData || [];
        const conversationIndex = conversations.findIndex(c => c.id_conversation === newMessage.conversation_id);

        if (conversationIndex !== -1) {
          // La conversación ya existe en la lista.
          const existingConvo = conversations[conversationIndex];

          // Verificamos si el remitente del mensaje es el "otro" usuario.
          // Si es así, usamos sus datos para corregir la preview.
          const otherUser = newMessage.sender_id !== user?.id_user
            ? newMessage.sender
            : existingConvo.users[0]; // Si yo envié el mensaje, mantengo los datos que ya tenía.

          const updatedConversation = {
            ...existingConvo,
            last_message_content: newMessage.content,
            last_message_date: newMessage.created_at,
            users: [otherUser], // Corregimos/actualizamos el usuario mostrado.
          };

          const filteredConversations = conversations.filter(c => c.id_conversation !== newMessage.conversation_id);
          return [updatedConversation, ...filteredConversations];
        } else {
          // Si la conversación es nueva y no está en la lista,
          // la forma más segura de obtenerla con los datos correctos del participante
          // es invalidando la query para que se vuelva a cargar desde el servidor.
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
          return oldData;
        }
      });
    };

    // Escuchamos el evento de nuevo mensaje
    socket.on('newMessage', handleNewMessage);

    // Nos unimos a las salas de todas nuestras conversaciones
    if (conversations) {
      conversations.forEach(convo => {
        socket.emit('joinConversation', `conversation:${convo.id_conversation}`);
      });
    }

    return () => {
      socket.off('newMessage', handleNewMessage);
      // Opcional: Salir de las salas al desmontar el componente
      if (conversations) {
        conversations.forEach(convo => {
          socket.emit('leaveConversation', `conversation:${convo.id_conversation}`);
        });
      }
    };
  }, [socket, queryClient, conversations]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300"
      >
        <MessageSquare size={24} />
      </button>

      {isOpen && (
        <>
          {/* Overlay to close on mobile click outside */}
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 sm:hidden" onClick={() => setIsOpen(false)} />

          <div className="fixed inset-x-4 top-20 sm:absolute sm:inset-auto sm:right-0 sm:top-full z-50 mt-2 sm:w-96 origin-top-right rounded-2xl bg-gray-900 border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="border-b border-white/5 bg-gray-800/50 px-5 py-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MessageSquare size={18} className="text-blue-400" />
                Mensajes
              </h3>
              <Link href="/messages" className="text-xs text-blue-500 font-bold hover:underline" onClick={() => setIsOpen(false)}>
                Ver todos
              </Link>
            </div>
            <div className="max-h-[70vh] sm:max-h-96 overflow-y-auto custom-scrollbar">
              {isLoading ? (
                <div className="flex flex-col justify-center items-center p-12">
                  <Loader2 className="animate-spin text-blue-500 mb-2" size={32} />
                  <p className="text-gray-500 text-sm">Cargando chats...</p>
                </div>
              ) : conversations && conversations.length > 0 ? (
                <div className="divide-y divide-white/5">
                  {conversations.map(convo => {
                    const otherUser = convo.users && convo.users.length > 0 ? convo.users[0] : null;

                    if (!otherUser) return null;

                    return (
                      <Link key={convo.id_conversation} href={`/message/${convo.id_conversation}`} onClick={() => setIsOpen(false)}>
                        <div className="flex items-center gap-3 p-4 hover:bg-white/5 transition-colors cursor-pointer group">
                          <img src={otherUser.profile_image || '/default-avatar.png'} alt="avatar" className="h-12 w-12 rounded-2xl object-cover border border-white/10 shadow-md group-hover:scale-105 transition-transform" />
                          <div className="flex-1 overflow-hidden">
                            <div className="flex justify-between items-baseline mb-0.5">
                              <p className="font-bold text-sm truncate text-white">{otherUser.name} {otherUser.lastname}</p>
                              {convo.last_message_date && (
                                <p className="text-[10px] text-gray-500 whitespace-nowrap ml-2">
                                  {formatDistanceToNow(new Date(convo.last_message_date), { addSuffix: false, locale: es })}
                                </p>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 truncate opacity-80">{convo.last_message_content || 'Sin mensajes aún'}</p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                    <MessageSquare size={24} className="text-gray-600" />
                  </div>
                  <h4 className="text-white font-semibold mb-1">Bandeja vacía</h4>
                  <p className="text-gray-500 text-xs px-6">Envía un mensaje a un proveedor para iniciar una conversación.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
