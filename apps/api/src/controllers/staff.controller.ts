import type { Request, Response } from 'express';
import { prisma } from '../config/database';
import { hashPassword } from '../services/auth.service';

export async function listStaff(req: Request, res: Response): Promise<void> {
  const { id: restaurantId } = req.params;

  const staff = await prisma.user.findMany({
    where: { restaurantId, role: 'STAFF' },
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
      restaurantId: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  res.json({ success: true, data: staff });
}

export async function createStaff(req: Request, res: Response): Promise<void> {
  const { email, password, name } = req.body as { email: string; password: string; name?: string };
  const { id: restaurantId } = req.params;

  if (!email || !password) {
    res.status(400).json({ success: false, error: 'Email and password are required' });
    return;
  }

  // Verify restaurant exists
  const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } });
  if (!restaurant) {
    res.status(404).json({ success: false, error: 'Restaurant not found' });
    return;
  }

  // Check email uniqueness
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
      role: 'STAFF',
      restaurantId,
      isActive: true,
    },
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
      restaurantId: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  res.status(201).json({ success: true, data: user });
}

export async function toggleStaff(req: Request, res: Response): Promise<void> {
  const { id: restaurantId, userId } = req.params;

  const user = await prisma.user.findFirst({
    where: { id: userId, restaurantId, role: 'STAFF' },
  });

  if (!user) {
    res.status(404).json({ success: false, error: 'Staff member not found' });
    return;
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { isActive: !user.isActive },
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
      restaurantId: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  res.json({ success: true, data: updated });
}

export async function deleteStaff(req: Request, res: Response): Promise<void> {
  const { id: restaurantId, userId } = req.params;

  // Prevent self-deletion
  if (req.user?.id === userId) {
    res.status(400).json({ success: false, error: 'You cannot delete your own account' });
    return;
  }

  const user = await prisma.user.findFirst({
    where: { id: userId, restaurantId, role: 'STAFF' },
  });

  if (!user) {
    res.status(404).json({ success: false, error: 'Staff member not found' });
    return;
  }

  await prisma.user.delete({ where: { id: userId } });

  res.json({ success: true, data: null, message: 'Staff member deleted successfully' });
}
