import Link from 'next/link';
import { Notification } from '@/types/common';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';
import { es } from 'date-fns/locale/es';
import { getNotificationLink } from '@/helpers/notificationUtils';

type NotificationItemProps = {
  notification: Notification;
  onClose: () => void;
  onMarkAsRead: (notificationId: number) => void;
};

export default function NotificationItem({ notification, onClose, onMarkAsRead }: NotificationItemProps) {
  const href = getNotificationLink(notification);

  const itemClasses = `block border-b border-gray-200 p-4 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/70 ${
    !notification.is_read ? 'bg-indigo-50 dark:bg-gray-700/50' : ''
  }`;

  const handleClick = () => {
    // Si la notificación no está leída, llama a la función para marcarla.
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }
    onClose();
  };

  const content = (
    <>
      <p className="font-semibold text-gray-800 dark:text-gray-200">{notification.title}</p>
      <p className="text-sm text-gray-600 dark:text-gray-400">{notification.message}</p>
      <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: es })}
      </p>
    </>
  );

  if (href === '#') {
    return <div className={itemClasses}>{content}</div>;
  }
  
  return (
    <Link href={href} onClick={handleClick} className={itemClasses}>
      {content}
    </Link>
  );
}