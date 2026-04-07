import type { Request, Response } from 'express';
import { prisma } from '../config/database';
import { CreateServiceItemSchema, UpdateServiceItemSchema } from '@repo/shared';
import { cloudinary } from '../config/cloudinary';
import { emitServiceItemAvailabilityChanged } from '../services/notification.service';

export async function getServiceCatalog(req: Request, res: Response): Promise<void> {
  const hotel = await prisma.hotel.findUnique({
    where: { id: req.params.hotelId },
    include: { settings: true },
  });
  if (!hotel) {
    res.status(404).json({ success: false, error: 'Hotel not found' });
    return;
  }

  const departments = await prisma.serviceDepartment.findMany({
    where: { hotelId: req.params.hotelId, isActive: true },
    orderBy: { sortOrder: 'asc' },
    include: {
      serviceItems: {
        where: { isAvailable: true },
        orderBy: { nameFr: 'asc' },
      },
    },
  });

  res.json({
    success: true,
    data: {
      hotel,
      departments,
      theme: hotel.settings?.themePreset ?? 'DARK_GOLD',
    },
  });
}

export async function getDepartmentCatalog(req: Request, res: Response): Promise<void> {
  const { hotelId, type } = req.params;
  const dept = await prisma.serviceDepartment.findUnique({
    where: { hotelId_type: { hotelId, type: type as any } },
    include: {
      serviceItems: {
        where: { isAvailable: true },
        orderBy: { nameFr: 'asc' },
      },
    },
  });

  if (!dept) {
    res.status(404).json({ success: false, error: 'Department not found' });
    return;
  }

  res.json({ success: true, data: dept });
}

export async function getAdminServiceCatalog(req: Request, res: Response): Promise<void> {
  const departments = await prisma.serviceDepartment.findMany({
    where: { hotelId: req.params.hotelId },
    orderBy: { sortOrder: 'asc' },
    include: {
      serviceItems: { orderBy: { nameFr: 'asc' } },
    },
  });
  res.json({ success: true, data: departments });
}

export async function createServiceItem(req: Request, res: Response): Promise<void> {
  const data = CreateServiceItemSchema.parse(req.body);

  const dept = await prisma.serviceDepartment.findUnique({
    where: { id: data.departmentId },
  });
  if (!dept || dept.hotelId !== req.params.hotelId) {
    res.status(400).json({ success: false, error: 'Department not found in this hotel' });
    return;
  }

  const item = await prisma.serviceItem.create({
    data: { ...data, hotelId: req.params.hotelId },
  });
  res.status(201).json({ success: true, data: item });
}

export async function updateServiceItem(req: Request, res: Response): Promise<void> {
  const data = UpdateServiceItemSchema.parse(req.body);
  const item = await prisma.serviceItem.update({ where: { id: req.params.id }, data });
  res.json({ success: true, data: item });
}

export async function toggleServiceItemAvailability(req: Request, res: Response): Promise<void> {
  const existing = await prisma.serviceItem.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    res.status(404).json({ success: false, error: 'Item not found' });
    return;
  }

  const item = await prisma.serviceItem.update({
    where: { id: req.params.id },
    data: { isAvailable: !existing.isAvailable },
  });

  emitServiceItemAvailabilityChanged(item.hotelId, item);
  res.json({ success: true, data: item });
}

export async function deleteServiceItem(req: Request, res: Response): Promise<void> {
  await prisma.serviceItem.delete({ where: { id: req.params.id } });
  res.json({ success: true, data: null });
}
