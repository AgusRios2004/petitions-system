'use client';

import { useState } from 'react';
import { useMutation, useQueryClient, useIsMutating } from '@tanstack/react-query';
import { createMessage } from '@/service/messageService';
import { Send } from 'lucide-react';
import TextareaAutosize from 'react-textarea-autosize';
import toast from 'react-hot-toast';
import { IMessage } from '@/types/common';
import { useAuth } from '@/context/AuthContext';

interface MessageInputProps {
  conversationId: number;
}

export default function MessageInput({ conversationId }: MessageInputProps) {
  const [content, setContent] = useState('');
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Hook para saber si la mutación de esta conversación está en curso
  const isSending = useIsMutating({ mutationKey: ['sendMessage', conversationId] }) > 0;

  const sendMessageMutation = useMutation({
    mutationKey: ['sendMessage', conversationId], // Clave de mutación única
    mutationFn: (newContent: string) => createMessage(conversationId, newContent), // Clave de mutación única
    onMutate: async (newContent) => {
      // Cancela cualquier recarga de datos en curso para evitar sobrescribir nuestra actualización optimista
      await queryClient.cancelQueries({ queryKey: ['messages', conversationId] });
      
      // Guarda el estado anterior por si necesitamos hacer rollback
      const previousMessages = queryClient.getQueryData<IMessage[]>(['messages', conversationId]);

      if (!user) {
        // No se puede crear un mensaje optimista sin un usuario
        return { previousMessages };
      }

      const optimisticId = Date.now(); // Usamos un ID temporal único

      // Actualiza el caché con el nuevo mensaje de forma optimista
      queryClient.setQueryData<IMessage[]>(['messages', conversationId], (old) => {
        const optimisticMessage: IMessage = {
          id_message: optimisticId, // Usar el ID temporal
          content: newContent,
          conversation_id: conversationId,
          sender_id: user.id_user,
          created_at: new Date().toISOString(),
          read: false,
          sender: {
            id_user: user.id_user,
            name: user.name,
            lastname: user.lastname,
            profile_image: user.profile_image,
          },
        };
        return old ? [...old, optimisticMessage] : [optimisticMessage];
      });

      // Limpiamos el input aquí para una mejor experiencia de usuario
      setContent(''); 
      // Pasamos el contexto con el ID temporal para usarlo en onError y onSuccess
      return { previousMessages, optimisticId };
    },
    onError: (_err, _newContent, context) => {
      // Si falla, removemos específicamente el mensaje optimista que falló por su ID
      queryClient.setQueryData<IMessage[]>(['messages', conversationId], (old) =>
        old?.filter((m) => m.id_message !== context?.optimisticId) ?? []
      );
      toast.error('Error al enviar el mensaje');
    },
    onSuccess: (data, _variables, context) => {
      // Buscamos el mensaje optimista por su ID temporal y lo reemplazamos con el real del servidor
      queryClient.setQueryData<IMessage[]>(['messages', conversationId], (old) => {
        return old?.map((message) =>
          message.id_message === context?.optimisticId ? data : message
        ) ?? [data];
      });

      // ¡Esta es la línea clave! Invalida la lista de conversaciones para que se actualice.
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!content.trim()) return;
    sendMessageMutation.mutate(content);
  }

  return (
    <footer className="p-4 border-t border-gray-200 dark:border-gray-700">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <TextareaAutosize
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1 resize-none p-2 border rounded-lg bg-gray-100 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          maxRows={5}
          disabled={isSending}
        />
        <button
          type="submit"
          className="p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 self-end"
          disabled={isSending || !content.trim()}
        >
          <Send size={20} />
        </button>
      </form>
    </footer>
  );
}