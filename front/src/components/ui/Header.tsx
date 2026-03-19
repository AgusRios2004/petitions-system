"use client";

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import NotificationBell from "@/components/notification/NotificationBell";
import MessageList from "@/components/message/MessageList";
import LogoutButton from '@/components/auth/LogoutButton';

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-gray-950/70 backdrop-blur-xl shadow-2xl">
      <div className="mx-auto flex max-w-screen-xl items-center justify-between px-4 h-16 sm:h-20">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/40 group-hover:rotate-6 transition-transform">
            <span className="text-white font-black text-lg">BT</span>
          </div>
          <span className="text-base sm:text-xl font-extrabold tracking-tight text-white group-hover:text-blue-400 transition-colors uppercase">
            Búsqueda<span className="text-blue-500">.</span>Trabajo
          </span>
        </Link>

        <div className="flex items-center gap-3 sm:gap-6">
          {user ? (
            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/profile" className="hidden sm:flex items-center gap-2 px-4 h-10 rounded-xl bg-blue-600/10 text-blue-400 border border-blue-500/20 text-[10px] font-black uppercase tracking-widest hover:bg-blue-600/20 transition-all">
                Dashboard
              </Link>
              <div className="flex items-center gap-1 sm:gap-4 bg-gray-900/50 p-1.5 rounded-2xl border border-white/5">
                <NotificationBell />
                <div className="w-px h-6 bg-white/10 hidden sm:block" />
                <MessageList />
                <div className="w-px h-6 bg-white/10 hidden sm:block" />
                <LogoutButton />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-sm sm:text-base font-semibold">
              <Link href="/login" className="text-gray-400 hover:text-white transition-colors px-2">Iniciar Sesión</Link>
              <Link href="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-900/30 hover:-translate-y-0.5 active:translate-y-0">
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
