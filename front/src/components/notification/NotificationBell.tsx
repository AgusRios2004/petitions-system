'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { getNotifications, markAllNotificationsAsRead, markNotificationAsRead } from '@/service/notificationService';
import { Notification } from '@/types/common';
import { useSocket } from '@/context/SocketContext';
import NotificationItem from './NotificationItem';
import toast from 'react-hot-toast';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  const { data: notifications, isLoading } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    staleTime: 5 * 60 * 1000,
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      const previousNotifications = queryClient.getQueryData<Notification[]>(['notifications']);
      queryClient.setQueryData<Notification[]>(['notifications'], old =>
        old ? old.map(n => ({ ...n, is_read: true })) : []
      );
      return { previousNotifications };
    },
    onError: (err, variables, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(['notifications'], context.previousNotifications);
      }
      toast.error('Error al marcar las notificaciones como leídas');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markOneAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onMutate: async (notificationId: number) => {
      // Cancelar cualquier refetch pendiente para que no sobreescriba nuestro cambio optimista
      await queryClient.cancelQueries({ queryKey: ['notifications'] });

      // Guardar el estado anterior
      const previousNotifications = queryClient.getQueryData<Notification[]>(['notifications']);

      // Actualizar la UI de forma optimista
      queryClient.setQueryData<Notification[]>(['notifications'], old =>
        old ? old.map(n => (n.id === notificationId ? { ...n, is_read: true } : n)) : []
      );

      // Devolver el estado anterior en el contexto para poder revertir en caso de error
      return { previousNotifications };
    },
    onError: (err, notificationId, context) => {
      // Si la mutación falla, revertir al estado anterior
      if (context?.previousNotifications) {
        queryClient.setQueryData(['notifications'], context.previousNotifications);
      }
      toast.error('Error al marcar la notificación como leída');
    },
    onSettled: () => {
      // Volver a sincronizar con el servidor una vez que la mutación ha terminado (éxito o error)
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  useEffect(() => {
    if (!socket) return;

    const handleInvalidate = () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    };

    socket.on('notification', handleInvalidate);

    return () => {
      socket.off('notification', handleInvalidate);
    };
  }, [socket, queryClient]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = Array.isArray(notifications) ? notifications.filter(n => !n.is_read).length : 0;

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Overlay to close on mobile click outside */}
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 sm:hidden" onClick={() => setIsOpen(false)} />

          <div className="fixed inset-x-4 top-20 sm:absolute sm:inset-auto sm:right-0 sm:top-full z-50 mt-2 sm:w-96 origin-top-right rounded-2xl bg-gray-900 border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-white/5 bg-gray-800/50 px-5 py-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Bell size={18} className="text-blue-400" />
                Notificaciones
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsReadMutation.mutate()}
                  disabled={markAllAsReadMutation.isPending}
                  className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold text-blue-400 hover:bg-blue-500/10 transition-colors"
                >
                  <CheckCheck size={14} />
                  Marcar todas
                </button>
              )}
            </div>
            <div className="max-h-[70vh] sm:max-h-96 overflow-y-auto custom-scrollbar">
              {isLoading ? (
                <div className="flex flex-col justify-center items-center p-12">
                  <Loader2 className="animate-spin text-blue-500 mb-2" size={32} />
                  <p className="text-gray-500 text-sm">Sincronizando...</p>
                </div>
              ) : notifications && notifications.length > 0 ? (
                <div className="divide-y divide-white/5">
                  {notifications.map(notif => (
                    <NotificationItem
                      key={notif.id}
                      notification={notif}
                      onClose={() => setIsOpen(false)}
                      onMarkAsRead={markOneAsReadMutation.mutate}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                    <Bell size={24} className="text-gray-600" />
                  </div>
                  <h4 className="text-white font-semibold mb-1">Todo al día</h4>
                  <p className="text-gray-500 text-xs px-6">No tienes notificaciones pendientes por ahora.</p>
                </div>
              )}
            </div>
            {notifications && notifications.length > 0 && (
              <div className="bg-gray-800/30 p-3 text-center border-t border-white/5">
                <button className="text-xs text-blue-500 font-bold hover:underline">Ver todo el historial</button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
