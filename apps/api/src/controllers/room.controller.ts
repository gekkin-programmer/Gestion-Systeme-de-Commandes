import type { Request, Response } from 'express';
import { prisma } from '../config/database';
import { CreateRoomSchema } from '@repo/shared';
import { generateQRCodeDataUrl, generateQRCodeBuffer, buildRoomUrl } from '../services/qrcode.service';
import { emitRoomStatusChanged } from '../services/notification.service';
import { env } from '../config/env';

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

async function generateUniqueRoomCode(): Promise<string> {
  let code = generateRoomCode();
  while (await prisma.room.findUnique({ where: { roomCode: code } })) {
    code = generateRoomCode();
  }
  return code;
}

export async function listRooms(req: Request, res: Response): Promise<void> {
  const rooms = await prisma.room.findMany({
    where: { hotelId: req.params.hotelId },
    orderBy: [{ floor: 'asc' }, { roomNumber: 'asc' }],
  });
  res.json({ success: true, data: rooms });
}

export async function createRoom(req: Request, res: Response): Promise<void> {
  const data = CreateRoomSchema.parse(req.body);
  try {
    const roomCode = await generateUniqueRoomCode();
    const room = await prisma.room.create({
      data: { ...data, hotelId: req.params.hotelId, roomCode },
    });
    res.status(201).json({ success: true, data: room });
  } catch (err: unknown) {
    const isPrismaUnique = (err as { code?: string })?.code === 'P2002';
    if (isPrismaUnique) {
      res.status(409).json({ success: false, error: `Une chambre avec le numéro ${data.roomNumber} existe déjà.` });
    } else {
      throw err;
    }
  }
}

export async function updateRoom(req: Request, res: Response): Promise<void> {
  const data = CreateRoomSchema.partial().parse(req.body);
  const room = await prisma.room.update({ where: { id: req.params.id }, data });
  emitRoomStatusChanged(room.hotelId, room);
  res.json({ success: true, data: room });
}

export async function deleteRoom(req: Request, res: Response): Promise<void> {
  await prisma.room.delete({ where: { id: req.params.id } });
  res.json({ success: true, data: null });
}

export async function generateRoomQR(req: Request, res: Response): Promise<void> {
  const room = await prisma.room.findUnique({ where: { id: req.params.id } });
  if (!room) {
    res.status(404).json({ success: false, error: 'Room not found' });
    return;
  }

  const url = buildRoomUrl(env.FRONTEND_URL, room.roomCode);
  const qrDataUrl = await generateQRCodeDataUrl(url);

  await prisma.room.update({ where: { id: room.id }, data: { qrCodeUrl: qrDataUrl } });

  res.json({ success: true, data: { url, qrCodeUrl: qrDataUrl } });
}

export async function downloadRoomQR(req: Request, res: Response): Promise<void> {
  const room = await prisma.room.findUnique({ where: { id: req.params.id } });
  if (!room) {
    res.status(404).json({ success: false, error: 'Room not found' });
    return;
  }

  const url = buildRoomUrl(env.FRONTEND_URL, room.roomCode);
  const buffer = await generateQRCodeBuffer(url);

  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Content-Disposition', `attachment; filename="qr-room-${room.roomNumber}.png"`);
  res.send(buffer);
}

export async function getRoomOccupancy(req: Request, res: Response): Promise<void> {
  const rooms = await prisma.room.findMany({
    where: { hotelId: req.params.hotelId },
    orderBy: [{ floor: 'asc' }, { roomNumber: 'asc' }],
    include: {
      stays: {
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: {
          serviceRequests: {
            where: { status: { notIn: ['CANCELLED'] } },
            include: { payment: true },
          },
        },
      },
    },
  });

  const data = rooms.map((room) => {
    const { stays, ...roomData } = room;
    const stay = stays[0] ?? null;
    const requests = stay?.serviceRequests ?? [];
    return {
      ...roomData,
      occupancy: stay
        ? {
            stayId: stay.id,
            checkInAt: stay.checkInAt,
            requestsCount: requests.length,
            totalAmount: requests.reduce((s, r) => s + r.totalAmount, 0),
          }
        : null,
    };
  });

  res.json({ success: true, data });
}
