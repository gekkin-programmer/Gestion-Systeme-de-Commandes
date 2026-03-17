import type { Request, Response } from 'express';
import { prisma } from '../config/database';
import { CreateTableSchema } from '@repo/shared';
import { generateQRCodeDataUrl, buildMenuUrl } from '../services/qrcode.service';
import { env } from '../config/env';

export async function getOccupancy(req: Request, res: Response): Promise<void> {
  const tables = await prisma.table.findMany({
    where: { restaurantId: req.params.restaurantId },
    orderBy: { number: 'asc' },
    include: {
      sessions: {
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: {
          orders: {
            where: { status: { notIn: ['CANCELLED'] } },
            include: { payment: true },
          },
        },
      },
    },
  });

  const data = tables.map((table) => {
    const { sessions, ...tableData } = table;
    const session = sessions[0] ?? null;
    const orders  = session?.orders ?? [];
    return {
      ...tableData,
      occupancy: session
        ? {
            sessionId:    session.id,
            createdAt:    session.createdAt,
            expiresAt:    session.expiresAt,
            ordersCount:  orders.length,
            totalAmount:  orders.reduce((s, o) => s + o.totalAmount, 0),
            unpaidAmount: orders
              .filter((o) => !o.payment || o.payment.status !== 'PAID')
              .reduce((s, o) => s + o.totalAmount, 0),
          }
        : null,
    };
  });

  res.json({ success: true, data });
}

const BASE_URL = env.FRONTEND_URL;

export async function listTables(req: Request, res: Response): Promise<void> {
  const tables = await prisma.table.findMany({
    where: { restaurantId: req.params.restaurantId },
    orderBy: { number: 'asc' },
  });
  res.json({ success: true, data: tables });
}

export async function createTable(req: Request, res: Response): Promise<void> {
  const data = CreateTableSchema.parse(req.body);
  const table = await prisma.table.create({
    data: { ...data, restaurantId: req.params.restaurantId },
  });
  res.status(201).json({ success: true, data: table });
}

export async function updateTable(req: Request, res: Response): Promise<void> {
  const data = CreateTableSchema.partial().parse(req.body);
  const table = await prisma.table.update({
    where: { id: req.params.id },
    data,
  });
  res.json({ success: true, data: table });
}

export async function deleteTable(req: Request, res: Response): Promise<void> {
  await prisma.table.delete({ where: { id: req.params.id } });
  res.json({ success: true, data: null });
}

export async function generateQR(req: Request, res: Response): Promise<void> {
  const table = await prisma.table.findUnique({
    where: { id: req.params.id },
    include: { restaurant: true },
  });

  if (!table) {
    res.status(404).json({ success: false, error: 'Table not found' });
    return;
  }

  const url = buildMenuUrl(BASE_URL, 'fr', table.restaurant.slug, table.qrToken);
  const qrDataUrl = await generateQRCodeDataUrl(url);

  await prisma.table.update({
    where: { id: table.id },
    data: { qrCodeUrl: qrDataUrl },
  });

  res.json({ success: true, data: { url, qrCodeUrl: qrDataUrl } });
}

export async function downloadQR(req: Request, res: Response): Promise<void> {
  const table = await prisma.table.findUnique({
    where: { id: req.params.id },
    include: { restaurant: true },
  });

  if (!table) {
    res.status(404).json({ success: false, error: 'Table not found' });
    return;
  }

  const url = buildMenuUrl(BASE_URL, 'fr', table.restaurant.slug, table.qrToken);
  const { generateQRCodeBuffer } = await import('../services/qrcode.service');
  const buffer = await generateQRCodeBuffer(url);

  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Content-Disposition', `attachment; filename="qr-table-${table.number}.png"`);
  res.send(buffer);
}
