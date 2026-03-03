import type { Server } from 'socket.io';
import { SOCKET_EVENTS } from '@repo/shared';

let io: Server | null = null;

export function setSocketServer(socketServer: Server): void {
  io = socketServer;
}

export function emitToRestaurant(restaurantId: string, event: string, data: unknown): void {
  if (!io) return;
  io.to(`staff:${restaurantId}`).emit(event, data);
  io.to(`restaurant:${restaurantId}`).emit(event, data);
}

export function emitToSession(sessionId: string, event: string, data: unknown): void {
  if (!io) return;
  io.to(`table:${sessionId}`).emit(event, data);
}

export function emitNewOrder(restaurantId: string, order: unknown): void {
  emitToRestaurant(restaurantId, SOCKET_EVENTS.ORDER_NEW, order);
}

export function emitOrderStatusChanged(restaurantId: string, sessionId: string, order: unknown): void {
  emitToRestaurant(restaurantId, SOCKET_EVENTS.ORDER_STATUS_CHANGED, order);
  emitToSession(sessionId, SOCKET_EVENTS.ORDER_STATUS_CHANGED, order);
}

export function emitPaymentStatusChanged(sessionId: string, payment: unknown): void {
  emitToSession(sessionId, SOCKET_EVENTS.PAYMENT_STATUS_CHANGED, payment);
}

export function emitMenuItemAvailabilityChanged(restaurantId: string, item: unknown): void {
  emitToRestaurant(restaurantId, SOCKET_EVENTS.MENU_ITEM_AVAILABILITY_CHANGED, item);
}
