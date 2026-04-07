import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { getSocket } from '@/lib/socket';
import type { Socket } from 'socket.io-client';

// Inlined from @repo/shared — Metro can't resolve monorepo workspace packages
const SOCKET_EVENTS = {
  REQUEST_NEW: 'request:new',
  REQUEST_STATUS_CHANGED: 'request:status_changed',
  REQUEST_CANCELLED: 'request:cancelled',
  PAYMENT_STATUS_CHANGED: 'payment:status_changed',
  SERVICE_ITEM_AVAILABILITY_CHANGED: 'service:item_availability_changed',
  ROOM_STATUS_CHANGED: 'room:status_changed',
  STAY_CLOSED: 'stay:closed',
  JOIN_HOTEL: 'join:hotel',
  JOIN_DEPARTMENT: 'join:department',
  JOIN_STAY: 'join:stay',
} as const;

interface UseHotelSocketOptions {
  onRequestNew?: (request: unknown) => void;
  onRequestStatusChanged?: (request: unknown) => void;
  onPaymentStatusChanged?: (payment: unknown) => void;
  onServiceItemAvailabilityChanged?: (item: unknown) => void;
  onRoomStatusChanged?: (room: unknown) => void;
}

/**
 * For staff/admin mobile: joins the hotel room and optionally a department room.
 * Handles AppState changes (foreground/background) for mobile.
 */
export function useHotelSocket(
  accessToken: string | null,
  department?: string | null,
  options: UseHotelSocketOptions = {},
) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!accessToken) return;

    const socket = getSocket();
    socketRef.current = socket;

    const joinRooms = () => {
      socket.emit(SOCKET_EVENTS.JOIN_HOTEL, { token: accessToken });
      if (department) {
        socket.emit(SOCKET_EVENTS.JOIN_DEPARTMENT, { token: accessToken, department });
      }
    };

    socket.on('connect', joinRooms);
    if (socket.connected) joinRooms();

    // Event listeners
    if (options.onRequestNew)
      socket.on(SOCKET_EVENTS.REQUEST_NEW, options.onRequestNew);
    if (options.onRequestStatusChanged)
      socket.on(SOCKET_EVENTS.REQUEST_STATUS_CHANGED, options.onRequestStatusChanged);
    if (options.onRoomStatusChanged)
      socket.on(SOCKET_EVENTS.ROOM_STATUS_CHANGED, options.onRoomStatusChanged);
    if (options.onServiceItemAvailabilityChanged)
      socket.on(SOCKET_EVENTS.SERVICE_ITEM_AVAILABILITY_CHANGED, options.onServiceItemAvailabilityChanged);

    // Mobile specific: Reconnect when app comes to foreground
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && !socket.connected) {
        socket.connect();
      }
    };
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      socket.off('connect', joinRooms);
      socket.off(SOCKET_EVENTS.REQUEST_NEW);
      socket.off(SOCKET_EVENTS.REQUEST_STATUS_CHANGED);
      socket.off(SOCKET_EVENTS.ROOM_STATUS_CHANGED);
      socket.off(SOCKET_EVENTS.SERVICE_ITEM_AVAILABILITY_CHANGED);
      subscription.remove();
    };
  }, [accessToken, department]);

  return socketRef.current;
}

interface UseStaySocketOptions {
  onRequestStatusChanged?: (request: unknown) => void;
  onPaymentStatusChanged?: (payment: unknown) => void;
  onStayClosed?: () => void;
}

/**
 * For guest mobile: joins the stay room (public, no auth token needed).
 * Receives real-time status updates for the guest's requests.
 */
export function useStaySocket(
  stayToken: string | null | undefined,
  options: UseStaySocketOptions = {},
) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!stayToken) return;

    const socket = getSocket();
    socketRef.current = socket;

    const joinStay = () => {
      socket.emit(SOCKET_EVENTS.JOIN_STAY, { stayToken });
    };

    socket.on('connect', joinStay);
    if (socket.connected) joinStay();

    if (options.onRequestStatusChanged)
      socket.on(SOCKET_EVENTS.REQUEST_STATUS_CHANGED, options.onRequestStatusChanged);
    if (options.onPaymentStatusChanged)
      socket.on(SOCKET_EVENTS.PAYMENT_STATUS_CHANGED, options.onPaymentStatusChanged);
    if (options.onStayClosed)
      socket.on(SOCKET_EVENTS.STAY_CLOSED, options.onStayClosed);

    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && !socket.connected) {
        socket.connect();
      }
    });

    return () => {
      socket.off('connect', joinStay);
      socket.off(SOCKET_EVENTS.REQUEST_STATUS_CHANGED);
      socket.off(SOCKET_EVENTS.PAYMENT_STATUS_CHANGED);
      socket.off(SOCKET_EVENTS.STAY_CLOSED);
      subscription.remove();
    };
  }, [stayToken]);

  return socketRef.current;
}
