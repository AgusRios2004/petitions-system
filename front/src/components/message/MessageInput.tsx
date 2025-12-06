'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createMessage } from '@/service/messageService';
import { Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { IMessage } from '@/types/common'; // Asumiendo que tienes este tipo
import { useAuth } from '@/context/AuthContext';

interface MessageInputProps {
  conversationId: number;
}

export default function MessageInput({ conversationId }: MessageInputProps) {
  const [content, setContent] = useState('');
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const sendMessageMutation = useMutation({
    mutationFn: (newContent: string) => createMessage(conversationId, newContent),
    // 1. onMutate se ejecuta antes de la mutación
    onMutate: async (newContent) => {
      // Cancela cualquier recarga de datos en curso para evitar sobrescribir nuestra actualización optimista
      await queryClient.cancelQueries({ queryKey: ['messages', conversationId] });

      // Guarda el estado anterior de los mensajes
      const previousMessages = queryClient.getQueryData<IMessage[]>(['messages', conversationId]);

      // Actualiza el caché con el nuevo mensaje de forma optimista
      if (!user) {
        // No se puede crear un mensaje optimista sin un usuario
        return { previousMessages };
      }
      queryClient.setQueryData<IMessage[]>(['messages', conversationId], (old) => {
        const optimisticMessage: IMessage = {
          id_message: Date.now(), // ID temporal
          content: newContent, // Usa el contenido pasado como argumento
          conversation_id: conversationId,
          sender_id: user.id_user,
          created_at: new Date().toISOString(),
          read: false, // Un mensaje nuevo no está leído por el receptor
          sender: { // Objeto del remitente con los datos del usuario actual
            id_user: user.id_user,
            name: user.name,
            lastname: user.lastname,
            profile_image: user.profile_image,
          },
        };
        return old ? [...old, optimisticMessage] : [optimisticMessage];
      });

      // Limpia el input inmediatamente
      setContent('');

      // Devuelve el estado anterior para poder hacer rollback en caso de error
      return { previousMessages };
    },
    // 2. Si la mutación falla, usamos el contexto de onMutate para revertir los cambios
    onError: (err, newTodo, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(['messages', conversationId], context.previousMessages);
      }
      toast.error('Error al enviar el mensaje');
    },
    // 3. Cuando la mutación termina (éxito o error), volvemos a solicitar los datos para asegurar consistencia
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
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
        <input type="text" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Escribe un mensaje..." className="flex-1 p-2 border rounded-lg bg-gray-100 dark:bg-gray-800 dark:text-white" disabled={sendMessageMutation.isPending} />
        <button type="submit" className="p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400" disabled={sendMessageMutation.isPending || !content.trim()}>
          <Send size={20} />
        </button>
      </form>
    </footer>
  );
}