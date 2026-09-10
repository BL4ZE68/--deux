'use client';

import { useCallback, useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { Notification } from '@/lib/types';

export function useNotifications() {
  const { notifications, addNotification, removeNotification, setNotifications } = useAuthStore();

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    fetch('/api/notifications', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        if (!response.ok) return;
        const data = await response.json();
        setNotifications(
          data.notifications.map((notification: any) => ({
            id: notification.id,
            space_id: '',
            user_id: notification.user_id,
            type: notification.kind,
            message: notification.message,
            relatedMemoryId: notification.reference_id,
            read: notification.is_read,
            createdAt: new Date(notification.createdAt),
          }))
        );
      })
      .catch((error) => console.error('Notifications loading failed:', error));
  }, [setNotifications]);

  const showNotification = useCallback(
    (type: string, message: string, relatedMemoryId?: string) => {
      const notification: Notification = {
        id: Math.random().toString(36).substring(7),
        space_id: 'temp',
        user_id: 'temp',
        type: type as Notification['type'],
        message,
        relatedMemoryId,
        read: false,
        createdAt: new Date(),
      };

      addNotification(notification);
      window.setTimeout(() => removeNotification(notification.id), 5000);
    },
    [addNotification, removeNotification]
  );

  return { notifications, showNotification };
}
