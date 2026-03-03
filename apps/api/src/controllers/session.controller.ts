import type { Request, Response } from 'express';
import { prisma } from '../config/database';
import { StartSessionSchema } from '@repo/shared';
import { env } from '../config/env';

export async function startSession(req: Request, res: Response): Promise<void> {
  const { tableToken, customerPhone } = StartSessionSchema.parse(req.body);

  const table = await prisma.table.findUnique({
    where: { qrToken: tableToken },
    include: { restaurant: true },
  });

  if (!table || !table.restaurant.isActive) {
    res.status(404).json({ success: false, error: 'Table not found or restaurant inactive' });
    return;
  }

  // Close any existing active sessions for this table
  await prisma.tableSession.updateMany({
    where: { tableId: table.id, isActive: true },
    data: { isActive: false },
  });

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

  // Update table status
  await prisma.table.update({
    where: { id: table.id },
    data: { status: 'OCCUPIED' },
  });

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
