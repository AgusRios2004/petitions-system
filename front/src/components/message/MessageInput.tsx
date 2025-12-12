'use client';

import { useState } from 'react';
import { useMutation, useQueryClient, useIsMutating } from '@tanstack/react-query';
import { createMessage } from '@/service/messageService';
import { Send } from 'lucide-react';
import TextareaAutosize from 'react-textarea-autosize';
import toast from 'react-hot-toast';
import { IMessage } from '@/types/common';

interface MessageInputProps {
  conversationId: number;
}

export default function MessageInput({ conversationId }: MessageInputProps) {
  const [content, setContent] = useState('');
  const queryClient = useQueryClient();

  // Hook para saber si la mutación de esta conversación está en curso
  const isSending = useIsMutating({ mutationKey: ['sendMessage', conversationId] }) > 0;

  const sendMessageMutation = useMutation({
    mutationKey: ['sendMessage', conversationId], // Clave de mutación única
    mutationFn: (newContent: string) => createMessage(conversationId, newContent), // Clave de mutación única
    onSuccess: () => {
      setContent(''); // Limpiamos el input solo cuando el servidor confirma
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: () => {
      toast.error('Error al enviar el mensaje');
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