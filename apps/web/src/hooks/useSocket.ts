'use client';

import { useEffect, useRef } from 'react';
import { connectSocket, disconnectSocket } from '@/lib/socket';
import { SOCKET_EVENTS } from '@repo/shared';
import type { Socket } from 'socket.io-client';

interface UseSocketOptions {
  onOrderNew?: (order: unknown) => void;
  onOrderStatusChanged?: (order: unknown) => void;
  onPaymentStatusChanged?: (payment: unknown) => void;
  onMenuItemAvailabilityChanged?: (item: unknown) => void;
}

export function useRestaurantSocket(accessToken: string | null, options: UseSocketOptions = {}) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!accessToken) return;

    const socket = connectSocket();
    socketRef.current = socket;

    socket.emit(SOCKET_EVENTS.JOIN_RESTAURANT, { token: accessToken });

    if (options.onOrderNew) socket.on(SOCKET_EVENTS.ORDER_NEW, options.onOrderNew);
    if (options.onOrderStatusChanged)
      socket.on(SOCKET_EVENTS.ORDER_STATUS_CHANGED, options.onOrderStatusChanged);

    return () => {
      socket.off(SOCKET_EVENTS.ORDER_NEW);
      socket.off(SOCKET_EVENTS.ORDER_STATUS_CHANGED);
    };
  }, [accessToken]);

  return socketRef.current;
}

export function useSessionSocket(sessionToken: string | null, options: UseSocketOptions = {}) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!sessionToken) return;

    const socket = connectSocket();
    socketRef.current = socket;

    socket.emit(SOCKET_EVENTS.JOIN_SESSION, { sessionToken });

    if (options.onOrderStatusChanged)
      socket.on(SOCKET_EVENTS.ORDER_STATUS_CHANGED, options.onOrderStatusChanged);
    if (options.onPaymentStatusChanged)
      socket.on(SOCKET_EVENTS.PAYMENT_STATUS_CHANGED, options.onPaymentStatusChanged);

    return () => {
      socket.off(SOCKET_EVENTS.ORDER_STATUS_CHANGED);
      socket.off(SOCKET_EVENTS.PAYMENT_STATUS_CHANGED);
    };
  }, [sessionToken]);

  return socketRef.current;
}
