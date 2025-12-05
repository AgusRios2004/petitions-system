'use client';

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { getMessagesByConversation } from "@/service/messageService";
import MessageInput from "@/components/message/MessageInput";

function ChatView({ conversationId }: { conversationId: number }) {
    const { data: messages, isLoading, error} = useQuery({
        queryKey: ['messages', conversationId],
        queryFn: () => getMessagesByConversation(conversationId),
    });

    if(isLoading) {
        return <div className="flex justify-center items-center p-4">
            <Loader2 className="animate-spin text-gray-500" />
        </div>
    }

    if(error) {
        return <div>Error: {error.message}</div>
    }

    return (
    <div className="flex flex-col h-full">
        <div className="flex-1 p-4">
            {/* Aquí es donde vas a renderizar los mensajes */}
            {messages?.map(msg => (
                <div key={msg.id_message}>
                <p>{msg.content}</p>
                </div>
            ))}
            {/* Aquí podrías añadir un div que se auto-scrollee hacia abajo */}
        </div>
        <MessageInput conversationId={conversationId} />
    </div>
    )
}

// El componente de página que exportas por defecto
export default function MessagePage({ params }: { params: { conversationId: string } }) {
  // Extraemos el ID de la URL y lo convertimos a número
  const conversationId = parseInt(params.conversationId, 10);

  // Validamos que el ID sea un número válido
  if (isNaN(conversationId)) {
    return <div>ID de conversación inválido.</div>;
  }

  // Renderizamos nuestro componente de chat, pasándole el ID
  return <ChatView conversationId={conversationId} />;
}