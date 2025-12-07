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
        <Link href="/" className="font-semibold">Búsqueda de Trabajo</Link>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <NotificationBell />
              <MessageList />
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login">Iniciar Sesión</Link>
              <Link href="/register">Registrarse</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
