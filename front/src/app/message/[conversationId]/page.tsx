import React, { Suspense } from "react";
import ChatView from "@/components/message/ChatView";
import { Loader2 } from "lucide-react";

type PageParams = {
  conversationId: string;
};

export default async function MessagePage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { conversationId } = await params;

  const id = Number(conversationId);

  if (isNaN(id)) {
    return <div>ID de conversación inválido.</div>;
  }

  return (
    <main className="flex justify-center items-center p-4 bg-gray-100 dark:bg-gray-900 min-h-screen">
      <div className="w-full max-w-2xl h-[70vh] bg-white dark:bg-gray-800 rounded-lg shadow-lg flex flex-col">
        <Suspense
          fallback={
            <div className="flex justify-center items-center h-full">
              <Loader2 className="animate-spin" />
            </div>
          }
        >
          <ChatView conversationId={id} />
        </Suspense>
      </div>
    </main>
  );
}
