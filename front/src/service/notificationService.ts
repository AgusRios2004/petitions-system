import apiClient from './apiClient'; // Asumo que tienes un cliente axios configurado en esta ruta
import { Notification } from '@/types/common'

export const getNotifications = async (): Promise<Notification[]> => {
  try {
    const response = await apiClient.get('/notification');
    // Extraemos el array de notificaciones de la respuesta anidada
    const data = response.data as { data: { notifications: Notification[] } };
    return data.data.notifications;
  } catch (e: unknown) {
    console.error("Error: ", e);
    throw e;
  }
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
  try {
    await apiClient.patch('/notification/read-all');
  } catch (e: unknown) {
    console.error("Error marking all notifications as read: ", e);
    throw e;
  }
};

export const markNotificationAsRead = async (notificationId: number): Promise<void> => {
  try {
    await apiClient.patch(`/notification/${notificationId}/read`);
  } catch (e: unknown) {
    console.error(`Error marking notification ${notificationId} as read: `, e);
    throw e;
  }
};

