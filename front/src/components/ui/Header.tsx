"use client";

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import NotificationBell from "@/components/notification/NotificationBell";
import MessageList from "@/components/message/MessageList";
import LogoutButton from '@/components/auth/LogoutButton';

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="border-b border-gray-200 bg-white/80 backdrop-blur dark:border-gray-800 dark:bg-gray-900/80">
      <div className="mx-auto flex max-w-screen-xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg sm:text-xl font-bold tracking-tight text-gray-900 dark:text-white hover:text-blue-500 transition-colors">
          Búsqueda de Trabajo
        </Link>
        <div className="flex items-center gap-2 sm:gap-4">
          {user ? (
            <div className="flex items-center gap-1 sm:gap-3">
              <NotificationBell />
              <MessageList />
              <LogoutButton />
            </div>
          ) : (
            <div className="flex items-center gap-3 text-sm sm:text-base font-medium">
              <Link href="/login" className="hover:text-blue-500">Iniciar Sesión</Link>
              <Link href="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors">Registrarse</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
