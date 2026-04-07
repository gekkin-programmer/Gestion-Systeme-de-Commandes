import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from './config/env';
import { prisma } from './config/database';
import { SOCKET_EVENTS } from '@repo/shared';

interface JoinHotelPayload {
  token: string;
}

interface JoinDepartmentPayload {
  token: string;
  department: string;
}

interface JoinStayPayload {
  stayToken: string;
}

export function initializeSocket(io: Server): void {
  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    /**
     * Staff joins their hotel room (receives all department events).
     * Requires valid JWT with STAFF/ADMIN role.
     */
    socket.on(SOCKET_EVENTS.JOIN_HOTEL, async (payload: JoinHotelPayload) => {
      try {
        const decoded = jwt.verify(payload.token, env.JWT_ACCESS_SECRET) as {
          sub: string;
          role: string;
          hotelId: string | null;
          departmentType: string | null;
        };

        if (!['STAFF', 'ADMIN', 'SUPER_ADMIN'].includes(decoded.role)) {
          socket.emit('error', { message: 'Unauthorized' });
          return;
        }

        if (decoded.hotelId) {
          await socket.join(`hotel:${decoded.hotelId}`);
          socket.emit('joined', { room: `hotel:${decoded.hotelId}` });
          console.log(`Staff ${decoded.sub} joined hotel room ${decoded.hotelId}`);
        }
      } catch {
        socket.emit('error', { message: 'Invalid token' });
      }
    });

    /**
     * Staff joins a specific department room.
     * Staff with departmentType set can only join their own dept.
     */
    socket.on(SOCKET_EVENTS.JOIN_DEPARTMENT, async (payload: JoinDepartmentPayload) => {
      try {
        const decoded = jwt.verify(payload.token, env.JWT_ACCESS_SECRET) as {
          sub: string;
          role: string;
          hotelId: string | null;
          departmentType: string | null;
        };

        if (!['STAFF', 'ADMIN', 'SUPER_ADMIN'].includes(decoded.role)) {
          socket.emit('error', { message: 'Unauthorized' });
          return;
        }

        if (!decoded.hotelId) {
          socket.emit('error', { message: 'No hotel assigned' });
          return;
        }

        // Staff with dept assignment can only join their own dept
        const targetDept = payload.department;
        if (
          decoded.departmentType &&
          decoded.departmentType !== targetDept &&
          decoded.role === 'STAFF'
        ) {
          socket.emit('error', { message: 'Access denied to this department' });
          return;
        }

        await socket.join(`dept:${decoded.hotelId}:${targetDept}`);
        socket.emit('joined', { room: `dept:${decoded.hotelId}:${targetDept}` });
        console.log(`Staff ${decoded.sub} joined dept room ${decoded.hotelId}:${targetDept}`);
      } catch {
        socket.emit('error', { message: 'Invalid token' });
      }
    });

    /**
     * Guest joins their stay room (no auth, stayToken lookup).
     */
    socket.on(SOCKET_EVENTS.JOIN_STAY, async (payload: JoinStayPayload) => {
      try {
        const stay = await prisma.roomStay.findUnique({
          where: { stayToken: payload.stayToken },
        });

        if (!stay || !stay.isActive) {
          socket.emit('error', { message: 'Stay not found or inactive' });
          return;
        }

        await socket.join(`stay:${stay.id}`);
        socket.emit('joined', { room: `stay:${stay.id}`, roomId: stay.roomId });
        console.log(`Guest joined stay room stay:${stay.id}`);
      } catch {
        socket.emit('error', { message: 'Failed to join stay' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });
}
