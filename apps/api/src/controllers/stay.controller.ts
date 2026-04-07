import type { Request, Response } from 'express';
import { prisma } from '../config/database';
import { StartStaySchema } from '@repo/shared';
import { emitStayClosed, emitRoomStatusChanged } from '../services/notification.service';

export async function startStay(req: Request, res: Response): Promise<void> {
  const parsed = StartStaySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      error: 'Invalid data',
      details: parsed.error.flatten().fieldErrors,
    });
    return;
  }
  const { roomCode, guestPhone } = parsed.data;

  const room = await prisma.room.findUnique({
    where: { roomCode: roomCode.toUpperCase() },
  });

  if (!room) {
    res.status(404).json({ success: false, error: 'Room not found — check the code and try again' });
    return;
  }

  if (room.status === 'MAINTENANCE') {
    res.status(400).json({ success: false, error: 'Room is under maintenance' });
    return;
  }

  // Close any existing active stay for this room
  await prisma.roomStay.updateMany({
    where: { roomId: room.id, isActive: true },
    data: { isActive: false, checkOutAt: new Date() },
  });

  const stay = await prisma.roomStay.create({
    data: { roomId: room.id, guestPhone },
    include: { room: true },
  });

  // Mark room as OCCUPIED
  const updatedRoom = await prisma.room.update({
    where: { id: room.id },
    data: { status: 'OCCUPIED' },
  });
  emitRoomStatusChanged(room.hotelId, updatedRoom);

  res.status(201).json({ success: true, data: stay });
}

export async function getStay(req: Request, res: Response): Promise<void> {
  const stay = await prisma.roomStay.findUnique({
    where: { stayToken: req.params.token },
    include: {
      room: { include: { hotel: true } },
      serviceRequests: {
        orderBy: { createdAt: 'desc' },
        include: { items: true, payment: true },
      },
    },
  });

  if (!stay) {
    res.status(404).json({ success: false, error: 'Stay not found' });
    return;
  }

  res.json({ success: true, data: stay });
}

export async function checkoutStay(req: Request, res: Response): Promise<void> {
  const stay = await prisma.roomStay.findUnique({
    where: { stayToken: req.params.token },
    include: { room: true },
  });

  if (!stay) {
    res.status(404).json({ success: false, error: 'Stay not found' });
    return;
  }

  if (!stay.isActive) {
    res.status(400).json({ success: false, error: 'Stay already checked out' });
    return;
  }

  const updated = await prisma.roomStay.update({
    where: { id: stay.id },
    data: { isActive: false, checkOutAt: new Date() },
    include: { room: true },
  });

  // Mark room as AVAILABLE
  const updatedRoom = await prisma.room.update({
    where: { id: stay.roomId },
    data: { status: 'AVAILABLE' },
  });

  emitStayClosed(stay.id, updated);
  emitRoomStatusChanged(stay.room.hotelId, updatedRoom);

  res.json({ success: true, data: updated });
}
