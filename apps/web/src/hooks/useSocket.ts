'use client';

import { useEffect, useRef } from 'react';
import { connectSocket } from '@/lib/socket';
import { SOCKET_EVENTS } from '@repo/shared';
import type { Socket } from 'socket.io-client';

interface UseSocketOptions {
  onOrderNew?: (order: unknown) => void;
  onOrderStatusChanged?: (order: unknown) => void;
  onPaymentStatusChanged?: (payment: unknown) => void;
  onMenuItemAvailabilityChanged?: (item: unknown) => void;
  onTableStatusChanged?: (table: unknown) => void;
}

export function useRestaurantSocket(accessToken: string | null, options: UseSocketOptions = {}) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!accessToken) return;

    const socket = connectSocket();
    socketRef.current = socket;

    // Re-join restaurant room on every connect (initial + after any reconnect)
    const rejoin = () => socket.emit(SOCKET_EVENTS.JOIN_RESTAURANT, { token: accessToken });
    socket.on('connect', rejoin);
    if (socket.connected) rejoin();

    if (options.onOrderNew)
      socket.on(SOCKET_EVENTS.ORDER_NEW, options.onOrderNew);
    if (options.onOrderStatusChanged)
      socket.on(SOCKET_EVENTS.ORDER_STATUS_CHANGED, options.onOrderStatusChanged);
    if (options.onTableStatusChanged)
      socket.on(SOCKET_EVENTS.TABLE_STATUS_CHANGED, options.onTableStatusChanged);

    return () => {
      socket.off('connect', rejoin);
      socket.off(SOCKET_EVENTS.ORDER_NEW);
      socket.off(SOCKET_EVENTS.ORDER_STATUS_CHANGED);
      socket.off(SOCKET_EVENTS.TABLE_STATUS_CHANGED);
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

    // Re-join session room on every connect (initial + after any reconnect)
    const rejoin = () => socket.emit(SOCKET_EVENTS.JOIN_SESSION, { sessionToken });
    socket.on('connect', rejoin);
    if (socket.connected) rejoin();

    if (options.onOrderStatusChanged)
      socket.on(SOCKET_EVENTS.ORDER_STATUS_CHANGED, options.onOrderStatusChanged);
    if (options.onPaymentStatusChanged)
      socket.on(SOCKET_EVENTS.PAYMENT_STATUS_CHANGED, options.onPaymentStatusChanged);

    return () => {
      socket.off('connect', rejoin);
      socket.off(SOCKET_EVENTS.ORDER_STATUS_CHANGED);
      socket.off(SOCKET_EVENTS.PAYMENT_STATUS_CHANGED);
    };
  }, [sessionToken]);

  return socketRef.current;
}
