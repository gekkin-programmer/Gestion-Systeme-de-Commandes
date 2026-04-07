import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.EXPO_PUBLIC_API_URL?.replace('/api/v1', '') ?? 'http://72.60.214.93:4000';

let socket: Socket | null = null;

export function getSocket(token?: string): Socket {
  if (!socket || !socket.connected) {
    socket = io(SOCKET_URL, {
      transports: ['websocket'],
      auth: token ? { token } : undefined,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });
  }
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
