import type { Request, Response } from 'express';
import { prisma } from '../config/database';
import { RegisterAdminSchema } from '@repo/shared';
import { hashPassword } from '../services/auth.service';

export async function listStaff(req: Request, res: Response): Promise<void> {
  const staff = await prisma.user.findMany({
    where: { hotelId: req.params.hotelId, role: { in: ['ADMIN', 'STAFF'] } },
    select: {
      id: true,
      email: true,
      role: true,
      hotelId: true,
      departmentType: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ success: true, data: staff });
}

export async function createStaff(req: Request, res: Response): Promise<void> {
  const { email, password, role, departmentType } = RegisterAdminSchema.parse(req.body);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ success: false, error: 'A user with this email already exists' });
    return;
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role,
      hotelId: req.params.hotelId,
      departmentType: departmentType ?? null,
      isActive: true,
    },
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

export async function toggleStaff(req: Request, res: Response): Promise<void> {
  const user = await prisma.user.findFirst({
    where: { id: req.params.userId, hotelId: req.params.hotelId },
  });
  if (!user) {
    res.status(404).json({ success: false, error: 'Staff not found' });
    return;
  }
  const updated = await prisma.user.update({
    where: { id: user.id },
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

export async function deleteStaff(req: Request, res: Response): Promise<void> {
  if (req.user?.id === req.params.userId) {
    res.status(400).json({ success: false, error: 'You cannot delete your own account' });
    return;
  }
  await prisma.user.delete({ where: { id: req.params.userId } });
  res.json({ success: true, data: null });
}
