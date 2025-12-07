'use client';

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, ArrowLeft } from "lucide-react";
import { getMessagesByConversation } from "@/service/messageService";
import MessageInput from "@/components/message/MessageInput";
import { useAuth } from "@/context/AuthContext";
import { IMessage } from "@/types/common";
import { Button } from "@/components/ui/Button";
import { useSocket } from "@/context/SocketContext";

interface ChatViewProps {
  conversationId: number;
}

export default function ChatView({ conversationId }: ChatViewProps) {
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const {
    data: messages,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => getMessagesByConversation(conversationId),
  });
  const { user: currentUser } = useAuth();

  useEffect(() => {
    if (socket && conversationId) {
      const roomName = `conversation:${conversationId}`;
      socket.emit('joinConversation', roomName);
      return () => {
        socket.emit('leaveConversation', roomName);
      };
    }
  }, [socket, conversationId]);

  // Efecto para escuchar nuevos mensajes en tiempo real
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage: IMessage) => {
      if (newMessage.conversation_id === conversationId) {
        queryClient.setQueryData<IMessage[]>(['messages', conversationId], (oldData) => {
          const oldMessages = oldData || [];
          return [...oldMessages, newMessage];
        });
      }
    };

    socket.on('newMessage', handleNewMessage);

    return () => {
      socket.off('newMessage', handleNewMessage);
    };
  }, [socket, conversationId, queryClient]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4 h-full">
        <Loader2 className="animate-spin text-gray-500" />
      </div>
    );
  }

  if (error instanceof Error) {
    return <div className="p-4">Error: {error.message}</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center border-b p-2 dark:border-gray-800">
        <Button
          onClick={() => router.back()}
          variant="ghost"
          size="icon"
          aria-label="Volver"
        >
          <ArrowLeft size={22} />
        </Button>
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages?.map((msg: IMessage) => {
          const isSender = msg.sender_id === currentUser?.id_user;
          const isOptimistic = typeof msg.id_message === 'number';
          return (
            <div
              key={msg.id_message}
              className={`flex items-end gap-2 ${isSender ? "justify-end" : "justify-start"}`}
            >
              {!isSender && (
                <img
                  src={msg.sender.profile_image || "/default-avatar.png"}
                  alt={msg.sender.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              )}
              <div className={`max-w-xs md:max-w-md p-3 rounded-lg transition-opacity duration-300 ${
                  isSender
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 dark:text-gray-200"
                } ${isOptimistic ? "opacity-60" : "opacity-100"}`}>
                <p>{msg.content}</p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <MessageInput conversationId={conversationId} />
    </div>
  );
}
