import { ReminderNotification } from '../types';
import { storageService } from './storage';

type NotificationListener = (notif: ReminderNotification) => void;
const listeners: NotificationListener[] = [];

export const notificationService = {
  // Request browser Notification API permission
  async requestPushPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch {
      return false;
    }
  },

  // Check if push is allowed
  isPushSupported(): boolean {
    return 'Notification' in window;
  },

  hasPushPermission(): boolean {
    return 'Notification' in window && Notification.permission === 'granted';
  },

  // Trigger real or in-app Push Notification
  triggerNotification(title: string, message: string, options?: { documentId?: string; documentTitle?: string; priority?: 'low' | 'medium' | 'high' }): ReminderNotification {
    const newNotif: ReminderNotification = {
      id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      title,
      message,
      documentId: options?.documentId,
      documentTitle: options?.documentTitle,
      scheduledTime: Date.now(),
      isRead: false,
      isCompleted: false,
      priority: options?.priority || 'medium',
      createdAt: Date.now()
    };

    // Save in storage
    const all = storageService.getNotifications();
    storageService.saveNotifications([newNotif, ...all]);

    // Send native system push notification if enabled
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body: message,
          icon: '/favicon.ico',
          tag: newNotif.id
        });
      } catch (e) {
        console.warn('Native notification suppressed in frame:', e);
      }
    }

    // Broadcast to active UI listeners
    listeners.forEach(l => l(newNotif));

    return newNotif;
  },

  // Subscribe to live incoming notifications
  subscribe(listener: NotificationListener): () => void {
    listeners.push(listener);
    return () => {
      const idx = listeners.indexOf(listener);
      if (idx !== -1) listeners.splice(idx, 1);
    };
  }
};
