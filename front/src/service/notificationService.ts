import apiClient from './apiClient'; // Asumo que tienes un cliente axios configurado en esta ruta

export interface Notification {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  related_petition_id?: number;
}

export const getNotifications = async (): Promise<Notification[]> => {
  try {
      const response = await apiClient.get('/notification');
      // Extraemos el array de notificaciones de la respuesta anidada
      return response.data.data.notifications;
  } catch (e: any) {
      console.error("Error: ", e);
      throw e;
  }
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
  await apiClient.patch('/notifications/read-all');
};
