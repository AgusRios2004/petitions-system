import { Notification } from '@/types/common';

/**
 * Genera el enlace de destino para una notificación basado en sus propiedades.
 * @param notification El objeto de notificación.
 * @returns La URL del enlace o '#' si no hay un destino específico.
 */
export function getNotificationLink(notification: Notification): string {
  const { related_petition_id } = notification;

  // Tanto para clientes como para proveedores, el contexto más útil es la petición.
  // Si la notificación está relacionada con una petición (directamente o a través de una postulación),
  // el enlace debe dirigir a la página de esa petición.
  if (related_petition_id) {
    return `/petition/${related_petition_id}`;
  }

  // Si la notificación no tiene un ID de petición asociado (ej: notificaciones administrativas, etc.),
  // no será clickeable.
  return '#';
}