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
    onSuccess: () => {
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
        <div className="absolute right-0 mt-2 w-80 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 dark:ring-gray-700">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Notificaciones</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-gray-700"
              >
                <CheckCheck size={14} />
                Marcar leídas
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center items-center p-4">
                <Loader2 className="animate-spin text-gray-500" />
              </div>
            ) : notifications && notifications.length > 0 ? (
              notifications.map(notif => (
                <NotificationItem key={notif.id} notification={notif} onClose={() => setIsOpen(false)} onMarkAsRead={markOneAsReadMutation.mutate}
                />
              ))
            ) : (
              <p className="p-8 text-center text-sm text-gray-500">No tienes notificaciones.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
