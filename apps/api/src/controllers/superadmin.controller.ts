import type { Request, Response } from 'express';
import { prisma } from '../config/database';
import { CreateRestaurantSchema, RegisterAdminSchema } from '@repo/shared';
import { hashPassword } from '../services/auth.service';

export async function createRestaurant(req: Request, res: Response): Promise<void> {
  const data = CreateRestaurantSchema.parse(req.body);
  const restaurant = await prisma.restaurant.create({
    data: {
      ...data,
      settings: { create: {} },
    },
    include: { settings: true },
  });
  res.status(201).json({ success: true, data: restaurant });
}

export async function listAllRestaurants(_req: Request, res: Response): Promise<void> {
  const restaurants = await prisma.restaurant.findMany({
    include: { settings: true, _count: { select: { users: true, orders: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ success: true, data: restaurants });
}

export async function toggleRestaurantActive(req: Request, res: Response): Promise<void> {
  const restaurant = await prisma.restaurant.findUnique({ where: { id: req.params.id } });
  if (!restaurant) {
    res.status(404).json({ success: false, error: 'Restaurant not found' });
    return;
  }

  const updated = await prisma.restaurant.update({
    where: { id: req.params.id },
    data: { isActive: !restaurant.isActive },
  });
  res.json({ success: true, data: updated });
}

export async function createAdminUser(req: Request, res: Response): Promise<void> {
  const { email, password, restaurantId, role } = RegisterAdminSchema.parse(req.body);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: await hashPassword(password),
      role,
      restaurantId,
    },
  });

  res.status(201).json({
    success: true,
    data: { id: user.id, email: user.email, role: user.role, restaurantId: user.restaurantId },
  });
}

export async function listUsers(_req: Request, res: Response): Promise<void> {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true, restaurantId: true, isActive: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ success: true, data: users });
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
    select: { id: true, email: true, role: true, isActive: true },
  });
  res.json({ success: true, data: updated });
}
