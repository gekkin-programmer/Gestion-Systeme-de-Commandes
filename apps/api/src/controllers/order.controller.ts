import type { Request, Response } from 'express';
import { prisma } from '../config/database';
import { CreateOrderSchema, UpdateOrderStatusSchema } from '@repo/shared';
import { generateOrderNumber } from '../services/payment.service';
import { emitNewOrder, emitOrderStatusChanged } from '../services/notification.service';

export async function createOrder(req: Request, res: Response): Promise<void> {
  const parsed = CreateOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      error: 'Invalid order data',
      details: parsed.error.flatten().fieldErrors,
    });
    return;
  }
  const { sessionToken, items, notes, customerPhone } = parsed.data;

  const session = await prisma.tableSession.findUnique({
    where: { sessionToken },
    include: { table: { include: { restaurant: { include: { settings: true } } } } },
  });

  if (!session || !session.isActive || session.expiresAt < new Date()) {
    res.status(400).json({ success: false, error: 'Invalid or expired session' });
    return;
  }

  // Validate & price all items
  const menuItems = await prisma.menuItem.findMany({
    where: {
      id: { in: items.map((i) => i.menuItemId) },
      restaurantId: session.table.restaurantId,
      isAvailable: true,
    },
  });

  if (menuItems.length !== items.length) {
    res.status(400).json({ success: false, error: 'One or more items are unavailable or not found' });
    return;
  }

  const menuItemMap = new Map(menuItems.map((m) => [m.id, m]));
  const orderItems = items.map((i) => {
    const item = menuItemMap.get(i.menuItemId)!;
    return {
      menuItemId: i.menuItemId,
      quantity: i.quantity,
      unitPrice: item.price,
      itemNameFr: item.nameFr,
      itemNameEn: item.nameEn,
    };
  });

  const subtotal = orderItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const taxAmount = 0;
  const totalAmount = subtotal;

  const order = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      tableSessionId: session.id,
      restaurantId: session.table.restaurantId,
      subtotal,
      taxAmount,
      totalAmount,
      notes,
      customerPhone: customerPhone ?? session.customerPhone,
      items: { create: orderItems },
    },
    include: { items: true, payment: true },
  });

  emitNewOrder(session.table.restaurantId, order);

  res.status(201).json({ success: true, data: order });
}

export async function getOrderStatus(req: Request, res: Response): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { items: true, payment: true },
  });

  if (!order) {
    res.status(404).json({ success: false, error: 'Order not found' });
    return;
  }

  res.json({ success: true, data: order });
}

export async function updateOrderStatus(req: Request, res: Response): Promise<void> {
  const { status } = UpdateOrderStatusSchema.parse(req.body);

  // Multi-tenancy: verify order belongs to the user's restaurant
  const existing = await prisma.order.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    res.status(404).json({ success: false, error: 'Order not found' });
    return;
  }
  if (req.user?.role !== 'SUPER_ADMIN' && existing.restaurantId !== req.user?.restaurantId) {
    res.status(403).json({ success: false, error: 'Access denied to this order' });
    return;
  }

  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: { status },
    include: { items: true, payment: true, tableSession: true },
  });

  emitOrderStatusChanged(order.restaurantId, order.tableSessionId, order);

  res.json({ success: true, data: order });
}

export async function listRestaurantOrders(req: Request, res: Response): Promise<void> {
  const { status, date } = req.query as { status?: string; date?: string };

  const where: Record<string, unknown> = { restaurantId: req.params.restaurantId };

  if (status) where.status = status;
  if (date) {
    const start = new Date(date as string);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    where.createdAt = { gte: start, lt: end };
  }

  const orders = await prisma.order.findMany({
    where,
    include: { items: true, payment: true, tableSession: { include: { table: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  res.json({ success: true, data: orders });
}

export async function getOrderHistory(req: Request, res: Response): Promise<void> {
  const { phone } = req.query as { phone?: string };

  if (!phone) {
    res.status(400).json({ success: false, error: 'Phone number required' });
    return;
  }

  const orders = await prisma.order.findMany({
    where: { customerPhone: phone },
    include: { items: true, payment: true },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  res.json({ success: true, data: orders });
}

export async function cancelOrderByCustomer(req: Request, res: Response): Promise<void> {
  const { sessionToken } = req.body as { sessionToken: string };

  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { tableSession: true },
  });

  if (!order) {
    res.status(404).json({ success: false, error: 'Order not found' });
    return;
  }

  // Validate the sessionToken belongs to this order's session
  if (order.tableSession.sessionToken !== sessionToken) {
    res.status(403).json({ success: false, error: 'Unauthorized' });
    return;
  }

  // Only PENDING orders can be cancelled by the customer
  if (order.status !== 'PENDING') {
    res.status(400).json({ success: false, error: 'Only pending orders can be cancelled' });
    return;
  }

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: { status: 'CANCELLED' },
    include: { items: true, payment: true, tableSession: true },
  });

  emitOrderStatusChanged(order.restaurantId, order.tableSessionId, updated);

  res.json({ success: true, data: updated });
}
