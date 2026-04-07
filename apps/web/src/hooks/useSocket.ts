'use client';

import { useEffect, useRef } from 'react';
import { connectSocket } from '@/lib/socket';
import { SOCKET_EVENTS } from '@repo/shared';
import type { Socket } from 'socket.io-client';

interface UseHotelSocketOptions {
  onRequestNew?: (request: unknown) => void;
  onRequestStatusChanged?: (request: unknown) => void;
  onPaymentStatusChanged?: (payment: unknown) => void;
  onServiceItemAvailabilityChanged?: (item: unknown) => void;
  onRoomStatusChanged?: (room: unknown) => void;
}

/**
 * For staff/admin: joins the hotel room and optionally a department room.
 * Reconnects automatically on socket reconnect.
 */
export function useHotelSocket(
  accessToken: string | null,
  department?: string | null,
  options: UseHotelSocketOptions = {},
) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!accessToken) return;

    const socket = connectSocket();
    socketRef.current = socket;

    const rejoinHotel = () => socket.emit(SOCKET_EVENTS.JOIN_HOTEL, { token: accessToken });
    socket.on('connect', rejoinHotel);
    if (socket.connected) rejoinHotel();

    // Also join dept room if provided
    let rejoinDept: (() => void) | null = null;
    if (department) {
      rejoinDept = () => socket.emit(SOCKET_EVENTS.JOIN_DEPARTMENT, { token: accessToken, department });
      socket.on('connect', rejoinDept);
      if (socket.connected) rejoinDept();
    }

    if (options.onRequestNew)
      socket.on(SOCKET_EVENTS.REQUEST_NEW, options.onRequestNew);
    if (options.onRequestStatusChanged)
      socket.on(SOCKET_EVENTS.REQUEST_STATUS_CHANGED, options.onRequestStatusChanged);
    if (options.onRoomStatusChanged)
      socket.on(SOCKET_EVENTS.ROOM_STATUS_CHANGED, options.onRoomStatusChanged);
    if (options.onServiceItemAvailabilityChanged)
      socket.on(SOCKET_EVENTS.SERVICE_ITEM_AVAILABILITY_CHANGED, options.onServiceItemAvailabilityChanged);

    return () => {
      socket.off('connect', rejoinHotel);
      if (rejoinDept) socket.off('connect', rejoinDept);
      socket.off(SOCKET_EVENTS.REQUEST_NEW);
      socket.off(SOCKET_EVENTS.REQUEST_STATUS_CHANGED);
      socket.off(SOCKET_EVENTS.ROOM_STATUS_CHANGED);
      socket.off(SOCKET_EVENTS.SERVICE_ITEM_AVAILABILITY_CHANGED);
    };
  }, [accessToken, department]);

  return socketRef.current;
}

interface UseStaySocketOptions {
  onRequestStatusChanged?: (request: unknown) => void;
  onPaymentStatusChanged?: (payment: unknown) => void;
  onStayClosed?: (stay: unknown) => void;
}

/**
 * For guests: joins the stay room using stayToken (no auth needed).
 */
export function useStaySocket(stayToken: string | null, options: UseStaySocketOptions = {}) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!stayToken) return;

    const socket = connectSocket();
    socketRef.current = socket;

    const rejoin = () => socket.emit(SOCKET_EVENTS.JOIN_STAY, { stayToken });
    socket.on('connect', rejoin);
    if (socket.connected) rejoin();

    if (options.onRequestStatusChanged)
      socket.on(SOCKET_EVENTS.REQUEST_STATUS_CHANGED, options.onRequestStatusChanged);
    if (options.onPaymentStatusChanged)
      socket.on(SOCKET_EVENTS.PAYMENT_STATUS_CHANGED, options.onPaymentStatusChanged);
    if (options.onStayClosed)
      socket.on(SOCKET_EVENTS.STAY_CLOSED, options.onStayClosed);

    return () => {
      socket.off('connect', rejoin);
      socket.off(SOCKET_EVENTS.REQUEST_STATUS_CHANGED);
      socket.off(SOCKET_EVENTS.PAYMENT_STATUS_CHANGED);
      socket.off(SOCKET_EVENTS.STAY_CLOSED);
    };
  }, [stayToken]);

  return socketRef.current;
}

// Backwards-compat alias
export { useHotelSocket as useRestaurantSocket };
