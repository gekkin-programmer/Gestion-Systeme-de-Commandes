import type { Request, Response } from 'express';
import { prisma } from '../config/database';
import { CreateServiceRequestSchema, UpdateRequestStatusSchema } from '@repo/shared';
import { generateRequestNumber } from '../services/payment.service';
import { emitNewRequest, emitRequestStatusChanged } from '../services/notification.service';

export async function createServiceRequest(req: Request, res: Response): Promise<void> {
  const parsed = CreateServiceRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      error: 'Invalid request data',
      details: parsed.error.flatten().fieldErrors,
    });
    return;
  }
  const { stayToken, department, items, notes, guestPhone } = parsed.data;

  const stay = await prisma.roomStay.findUnique({
    where: { stayToken },
    include: { room: { include: { hotel: { include: { settings: true } } } } },
  });

  if (!stay || !stay.isActive) {
    res.status(400).json({ success: false, error: 'Invalid or inactive stay' });
    return;
  }

  // Validate & price all items
  const serviceItems = await prisma.serviceItem.findMany({
    where: {
      id: { in: items.map((i) => i.serviceItemId) },
      hotelId: stay.room.hotel.id,
      isAvailable: true,
    },
  });

  if (serviceItems.length !== items.length) {
    res.status(400).json({ success: false, error: 'One or more items are unavailable or not found' });
    return;
  }

  const itemMap = new Map(serviceItems.map((s) => [s.id, s]));
  const requestItems = items.map((i) => {
    const svc = itemMap.get(i.serviceItemId)!;
    return {
      serviceItemId: i.serviceItemId,
      quantity: i.quantity,
      unitPrice: svc.price ?? 0,
      itemNameFr: svc.nameFr,
      itemNameEn: svc.nameEn,
    };
  });

  const taxRate = stay.room.hotel.settings?.taxRate ?? 0;
  const subtotal = requestItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const taxAmount = Math.round(subtotal * taxRate);
  const totalAmount = subtotal + taxAmount;

  const serviceRequest = await prisma.serviceRequest.create({
    data: {
      requestNumber: generateRequestNumber(),
      roomStayId: stay.id,
      hotelId: stay.room.hotel.id,
      department,
      subtotal,
      taxAmount,
      totalAmount,
      notes,
      guestPhone: guestPhone ?? stay.guestPhone,
      items: { create: requestItems },
    },
    include: { items: true, payment: true },
  });

  emitNewRequest(stay.room.hotel.id, department, serviceRequest);

  res.status(201).json({ success: true, data: serviceRequest });
}

export async function getRequestStatus(req: Request, res: Response): Promise<void> {
  const request = await prisma.serviceRequest.findUnique({
    where: { id: req.params.id },
    include: { items: true, payment: true, roomStay: { include: { room: true } } },
  });

  if (!request) {
    res.status(404).json({ success: false, error: 'Request not found' });
    return;
  }

  res.json({ success: true, data: request });
}

export async function updateRequestStatus(req: Request, res: Response): Promise<void> {
  const { status } = UpdateRequestStatusSchema.parse(req.body);

  const existing = await prisma.serviceRequest.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    res.status(404).json({ success: false, error: 'Request not found' });
    return;
  }
  if (req.user?.role !== 'SUPER_ADMIN' && existing.hotelId !== req.user?.hotelId) {
    res.status(403).json({ success: false, error: 'Access denied to this request' });
    return;
  }

  // Staff assigned to a dept can only update their dept's requests
  if (req.user?.departmentType && req.user.departmentType !== existing.department && req.user.role === 'STAFF') {
    res.status(403).json({ success: false, error: 'Access denied to this department' });
    return;
  }

  const request = await prisma.serviceRequest.update({
    where: { id: req.params.id },
    data: { status },
    include: { items: true, payment: true, roomStay: { include: { room: true } } },
  });

  emitRequestStatusChanged(request.hotelId, request.department, request.roomStayId, request);

  res.json({ success: true, data: request });
}

export async function listHotelRequests(req: Request, res: Response): Promise<void> {
  const { status, department, date } = req.query as {
    status?: string;
    department?: string;
    date?: string;
  };

  const where: Record<string, unknown> = { hotelId: req.params.hotelId };

  // Staff with dept assignment only sees their dept
  const user = req.user;
  if (user?.departmentType && user.role === 'STAFF') {
    where.department = user.departmentType;
  } else if (department) {
    where.department = department;
  }

  if (status) where.status = status;
  if (date) {
    const start = new Date(date as string);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    where.createdAt = { gte: start, lt: end };
  }

  const requests = await prisma.serviceRequest.findMany({
    where,
    include: { items: true, payment: true, roomStay: { include: { room: true } } },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  res.json({ success: true, data: requests });
}
