"use client";
import { useAuth } from '@/context/AuthContext';

export default function LogoutButton() {
  const { user, logout } = useAuth();
  if (!user) return null;
  return (
    <button
      onClick={logout}
      className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
    >
      Cerrar sesión
    </button>
  );
}

