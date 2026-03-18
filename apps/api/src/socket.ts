import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from './config/env';
import { prisma } from './config/database';
import { SOCKET_EVENTS } from '@repo/shared';

interface JoinRestaurantPayload {
  token: string;
}

interface JoinSessionPayload {
  sessionToken: string;
}

export function initializeSocket(io: Server): void {
  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    /**
     * Staff joins their restaurant room.
     * Requires valid JWT with STAFF/ADMIN role.
     */
    socket.on(SOCKET_EVENTS.JOIN_RESTAURANT, async (payload: JoinRestaurantPayload) => {
      try {
        const decoded = jwt.verify(payload.token, env.JWT_ACCESS_SECRET) as {
          sub: string;
          role: string;
          restaurantId: string | null;
        };

        if (!['STAFF', 'ADMIN', 'SUPER_ADMIN'].includes(decoded.role)) {
          socket.emit('error', { message: 'Unauthorized' });
          return;
        }

        if (decoded.restaurantId) {
          await socket.join(`staff:${decoded.restaurantId}`);
          socket.emit('joined', { room: `staff:${decoded.restaurantId}` });
          console.log(`Staff ${decoded.sub} joined restaurant room ${decoded.restaurantId}`);
        }
      } catch {
        socket.emit('error', { message: 'Invalid token' });
      }
    });

    /**
     * Customer joins their table session room.
     */
    socket.on(SOCKET_EVENTS.JOIN_SESSION, async (payload: JoinSessionPayload) => {
      try {
        const session = await prisma.tableSession.findUnique({
          where: { sessionToken: payload.sessionToken },
        });

        if (!session) {
          socket.emit('error', { message: 'Session not found' });
          return;
        }

        await socket.join(`table:${session.id}`);
        socket.emit('joined', { room: `table:${session.id}`, tableId: session.tableId });
        console.log(`Customer joined session room table:${session.id}`);
      } catch {
        socket.emit('error', { message: 'Failed to join session' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });
}
