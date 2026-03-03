'use client';

import { useCallback } from 'react';

export function useNotification() {
  const playNewOrderSound = useCallback(() => {
    try {
      const audio = new Audio('/sounds/new-order.mp3');
      audio.play().catch(() => {
        // Browser may block autoplay — ignore
      });
    } catch {
      // Ignore
    }
  }, []);

  const showBrowserNotification = useCallback((title: string, body: string) => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/icon-192.png' });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          new Notification(title, { body, icon: '/icon-192.png' });
        }
      });
    }
  }, []);

  return { playNewOrderSound, showBrowserNotification };
}
