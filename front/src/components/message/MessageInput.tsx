'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createMessage } from '@/service/messageService';
import { Send } from 'lucide-react';
import toast from 'react-hot-toast';

interface MessageInputProps {
  conversationId: number;
}

export default function MessageInput({ conversationId }: MessageInputProps) {
  const [content, setContent] = useState('');
  const queryClient = useQueryClient();

  const sendMessageMutation = useMutation({
    mutationFn: () => createMessage(conversationId, content),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['messages', conversationId]});
    },
    onError: (error) => {
        console.error('Error al enviar el mensaje:', error);
        toast.error('Error al enviar el mensaje');
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!content.trim()) return;
    sendMessageMutation.mutate();
    setContent('');
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