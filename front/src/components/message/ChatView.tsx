'use client';

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { getMessagesByConversation } from "@/service/messageService";
import MessageInput from "@/components/message/MessageInput";
import { useAuth } from "@/context/AuthContext";
import { IMessage } from "@/types/common";

interface ChatViewProps {
  conversationId: number;
}

export default function ChatView({ conversationId }: ChatViewProps) {
  const {
    data: messages,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => getMessagesByConversation(conversationId),
  });
  const { user: currentUser } = useAuth();

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
      {/* Mensajes */}
      <div className="flex-1 p-4 overflow-y-auto space-y-2">
        {messages?.map((msg: IMessage) => {
          const isSender = msg.sender_id === currentUser?.id_user;
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
              <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${isSender ? "bg-indigo-600 text-white" : "bg-gray-200 dark:bg-gray-700 dark:text-gray-200"}`}>
                <p>{msg.content}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <MessageInput conversationId={conversationId} />
    </div>
  );
}
