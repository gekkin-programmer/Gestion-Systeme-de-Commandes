import type { Server } from 'socket.io';
import { SOCKET_EVENTS } from '@repo/shared';

let io: Server | null = null;

export function setSocketServer(socketServer: Server): void {
  io = socketServer;
}

export function emitToHotel(hotelId: string, event: string, data: unknown): void {
  if (!io) return;
  io.to(`hotel:${hotelId}`).emit(event, data);
}

export function emitToDepartment(hotelId: string, dept: string, event: string, data: unknown): void {
  if (!io) return;
  io.to(`dept:${hotelId}:${dept}`).emit(event, data);
}

export function emitToStay(stayId: string, event: string, data: unknown): void {
  if (!io) return;
  io.to(`stay:${stayId}`).emit(event, data);
}

export function emitNewRequest(hotelId: string, department: string, request: unknown): void {
  emitToHotel(hotelId, SOCKET_EVENTS.REQUEST_NEW, request);
  emitToDepartment(hotelId, department, SOCKET_EVENTS.REQUEST_NEW, request);
}

export function emitRequestStatusChanged(
  hotelId: string,
  department: string,
  stayId: string,
  request: unknown,
): void {
  emitToHotel(hotelId, SOCKET_EVENTS.REQUEST_STATUS_CHANGED, request);
  emitToDepartment(hotelId, department, SOCKET_EVENTS.REQUEST_STATUS_CHANGED, request);
  emitToStay(stayId, SOCKET_EVENTS.REQUEST_STATUS_CHANGED, request);
}

export function emitPaymentStatusChanged(stayId: string, payment: unknown): void {
  emitToStay(stayId, SOCKET_EVENTS.PAYMENT_STATUS_CHANGED, payment);
}

export function emitServiceItemAvailabilityChanged(hotelId: string, item: unknown): void {
  emitToHotel(hotelId, SOCKET_EVENTS.SERVICE_ITEM_AVAILABILITY_CHANGED, item);
}

export function emitRoomStatusChanged(hotelId: string, room: unknown): void {
  emitToHotel(hotelId, SOCKET_EVENTS.ROOM_STATUS_CHANGED, room);
}

export function emitStayClosed(stayId: string, stay: unknown): void {
  emitToStay(stayId, SOCKET_EVENTS.STAY_CLOSED, stay);
}
