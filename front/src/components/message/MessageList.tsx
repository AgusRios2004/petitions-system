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
        <div className="absolute right-0 z-50 mt-2 w-80 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 dark:ring-gray-700">
          <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Mensajes</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center items-center p-4">
                <Loader2 className="animate-spin text-gray-500" />
              </div>
            ) : conversations && conversations.length > 0 ? (
              conversations.map(convo => {
                const otherUser = convo.users && convo.users.length > 0 ? convo.users[0] : null;

                if (!otherUser) return null;

                return (
                <Link key={convo.id_conversation} href={`/message/${convo.id_conversation}`} onClick={() => setIsOpen(false)} >
                  <div className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b dark:border-gray-700">
                    <img src={otherUser.profile_image || '/default-avatar.png'} alt="avatar" className="h-10 w-10 rounded-full object-cover" />
                    <div className="flex-1 overflow-hidden">
                      <p className="font-semibold text-sm truncate dark:text-white">{otherUser.name} {otherUser.lastname}</p>
                      <p className="text-sm text-gray-500 truncate dark:text-gray-400">{convo.last_message_content}</p>
                    </div>
                    {convo.last_message_date && (
                       <p className="text-xs text-gray-400 self-start">
                         {formatDistanceToNow(new Date(convo.last_message_date), { addSuffix: true, locale: es })}
                       </p>
                    )}
                  </div>
                </Link>)
              })
            ) : (
              <p className="p-8 text-center text-sm text-gray-500">No tienes conversaciones.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
