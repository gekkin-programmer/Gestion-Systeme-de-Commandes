import type { Request, Response } from 'express';
import { prisma } from '../config/database';
import { redis } from '../config/redis';
import { StartSessionSchema } from '@repo/shared';
import { env } from '../config/env';
import { emitTableStatusChanged } from '../services/notification.service';

export async function startSession(req: Request, res: Response): Promise<void> {
  const parsed = StartSessionSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: 'Invalid request', details: parsed.error.flatten().fieldErrors });
    return;
  }
  const { tableToken, customerPhone } = parsed.data;

  // Per-QR-token rate limit: max 20 new sessions per hour per table
  // Prevents someone from hammering a specific QR code to flood the DB
  const rlKey = `rl:session:qr:${tableToken}`;
  const scanCount = await redis.incr(rlKey);
  if (scanCount === 1) {
    await redis.expire(rlKey, 3600);
  }
  if (scanCount > 20) {
    res.status(429).json({
      success: false,
      error: 'Too many scans for this table. Please wait before trying again.',
    });
    return;
  }

  const table = await prisma.table.findUnique({
    where: { qrToken: tableToken },
    include: { restaurant: true },
  });

  if (!table || !table.restaurant.isActive) {
    res.status(404).json({ success: false, error: 'Table not found or restaurant inactive' });
    return;
  }

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + env.TABLE_SESSION_TTL_HOURS);

  const session = await prisma.tableSession.create({
    data: {
      tableId: table.id,
      customerPhone,
      expiresAt,
    },
    include: { table: true },
  });

  // Mark table occupied and notify admin dashboard
  const updatedTable = await prisma.table.update({
    where: { id: table.id },
    data: { status: 'OCCUPIED' },
  });
  emitTableStatusChanged(table.restaurant.id, updatedTable);

  res.status(201).json({
    success: true,
    data: {
      sessionToken: session.sessionToken,
      tableNumber: table.number,
      tableLabel: table.label,
      restaurantName: table.restaurant.name,
      restaurantSlug: table.restaurant.slug,
      expiresAt: session.expiresAt,
    },
  });
}

export async function getSession(req: Request, res: Response): Promise<void> {
  const session = await prisma.tableSession.findUnique({
    where: { sessionToken: req.params.token },
    include: { table: { include: { restaurant: true } } },
  });

  if (!session) {
    res.status(404).json({ success: false, error: 'Session not found' });
    return;
  }

  if (!session.isActive || session.expiresAt < new Date()) {
    res.status(410).json({ success: false, error: 'Session expired' });
    return;
  }

  res.json({ success: true, data: session });
}
