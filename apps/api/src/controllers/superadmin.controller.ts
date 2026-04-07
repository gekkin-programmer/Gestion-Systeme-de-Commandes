import type { Request, Response } from 'express';
import { prisma } from '../config/database';
import { CreateHotelSchema, RegisterAdminSchema } from '@repo/shared';
import { hashPassword } from '../services/auth.service';

export async function listAllHotels(_req: Request, res: Response): Promise<void> {
  const hotels = await prisma.hotel.findMany({ orderBy: { createdAt: 'desc' } });
  res.json({ success: true, data: hotels });
}

export async function createHotel(req: Request, res: Response): Promise<void> {
  const data = CreateHotelSchema.parse(req.body);
  const hotel = await prisma.hotel.create({
    data: { ...data, settings: { create: {} } },
    include: { settings: true },
  });
  res.status(201).json({ success: true, data: hotel });
}

export async function toggleHotelActive(req: Request, res: Response): Promise<void> {
  const hotel = await prisma.hotel.findUnique({ where: { id: req.params.id } });
  if (!hotel) {
    res.status(404).json({ success: false, error: 'Hotel not found' });
    return;
  }
  const updated = await prisma.hotel.update({
    where: { id: req.params.id },
    data: { isActive: !hotel.isActive },
  });
  res.json({ success: true, data: updated });
}

export async function listUsers(_req: Request, res: Response): Promise<void> {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      role: true,
      hotelId: true,
      departmentType: true,
      isActive: true,
      createdAt: true,
    },
  });
  res.json({ success: true, data: users });
}

export async function createAdminUser(req: Request, res: Response): Promise<void> {
  const { email, password, hotelId, role, departmentType } = RegisterAdminSchema.parse(req.body);
  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, passwordHash, role, hotelId, departmentType: departmentType ?? null },
    select: {
      id: true,
      email: true,
      role: true,
      hotelId: true,
      departmentType: true,
      isActive: true,
      createdAt: true,
    },
  });
  res.status(201).json({ success: true, data: user });
}

export async function toggleUserActive(req: Request, res: Response): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) {
    res.status(404).json({ success: false, error: 'User not found' });
    return;
  }
  const updated = await prisma.user.update({
    where: { id: req.params.id },
    data: { isActive: !user.isActive },
    select: {
      id: true,
      email: true,
      role: true,
      hotelId: true,
      departmentType: true,
      isActive: true,
      createdAt: true,
    },
  });
  res.json({ success: true, data: updated });
}
