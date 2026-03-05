import type { Request, Response } from 'express';
import { prisma } from '../config/database';
import { redis } from '../config/redis';
import { logger } from '../config/logger';
import { CreateMenuItemSchema, CreateCategorySchema } from '@repo/shared';
import { emitMenuItemAvailabilityChanged } from '../services/notification.service';

const MENU_TTL = 5 * 60; // 5 minutes — menus rarely change mid-service

function menuKey(restaurantId: string)  { return `menu:id:${restaurantId}`; }
function slugKey(slug: string)          { return `menu:slug:${slug}`; }

async function getFromCache<T>(key: string): Promise<T | null> {
  try {
    const hit = await redis.get(key);
    return hit ? (JSON.parse(hit) as T) : null;
  } catch (err) {
    logger.warn({ err, key }, 'Cache read failed');
    return null;
  }
}

async function setCache(key: string, data: unknown): Promise<void> {
  try {
    await redis.setex(key, MENU_TTL, JSON.stringify(data));
  } catch (err) {
    logger.warn({ err, key }, 'Cache write failed');
  }
}

async function invalidateMenuCache(restaurantId: string, slug?: string): Promise<void> {
  const keys = [menuKey(restaurantId)];
  if (slug) keys.push(slugKey(slug));
  try {
    await redis.del(...keys);
  } catch (err) {
    logger.warn({ err }, 'Cache invalidation failed');
  }
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function listCategories(req: Request, res: Response): Promise<void> {
  const categories = await prisma.category.findMany({
    where: { restaurantId: req.params.restaurantId },
    orderBy: { sortOrder: 'asc' },
  });
  res.json({ success: true, data: categories });
}

export async function createCategory(req: Request, res: Response): Promise<void> {
  const data = CreateCategorySchema.parse(req.body);
  const category = await prisma.category.create({
    data: { ...data, restaurantId: req.params.restaurantId },
  });
  await invalidateMenuCache(req.params.restaurantId);
  res.status(201).json({ success: true, data: category });
}

export async function updateCategory(req: Request, res: Response): Promise<void> {
  const data = CreateCategorySchema.partial().parse(req.body);
  const category = await prisma.category.update({
    where: { id: req.params.id },
    data,
  });
  await invalidateMenuCache(category.restaurantId);
  res.json({ success: true, data: category });
}

export async function deleteCategory(req: Request, res: Response): Promise<void> {
  const category = await prisma.category.delete({ where: { id: req.params.id } });
  await invalidateMenuCache(category.restaurantId);
  res.json({ success: true, data: null });
}

// ─── Menu Items ───────────────────────────────────────────────────────────────

export async function getMenu(req: Request, res: Response): Promise<void> {
  const { restaurantId } = req.params;
  const cached = await getFromCache<unknown>(menuKey(restaurantId));
  if (cached) {
    res.setHeader('X-Cache', 'HIT');
    res.json(cached);
    return;
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    include: { settings: true },
  });
  if (!restaurant || !restaurant.isActive) {
    res.status(404).json({ success: false, error: 'Restaurant not found or inactive' });
    return;
  }

  const categories = await prisma.category.findMany({
    where: { restaurantId, isActive: true },
    orderBy: { sortOrder: 'asc' },
    include: {
      menuItems: {
        where: { isAvailable: true },
        orderBy: [{ isPopular: 'desc' }, { nameFr: 'asc' }],
      },
    },
  });

  const theme = (restaurant.settings?.themePreset ?? 'DARK_GOLD') as string;
  const { settings: _s, ...restaurantData } = restaurant;
  const mapped = categories.map(({ menuItems, ...cat }) => ({ ...cat, items: menuItems }));
  const payload = { success: true, data: { restaurant: restaurantData, categories: mapped, theme } };

  await setCache(menuKey(restaurantId), payload);
  res.setHeader('X-Cache', 'MISS');
  res.setHeader('Cache-Control', `public, max-age=${MENU_TTL}`);
  res.json(payload);
}

export async function getMenuBySlug(req: Request, res: Response): Promise<void> {
  const { slug } = req.params;
  const cached = await getFromCache<unknown>(slugKey(slug));
  if (cached) {
    res.setHeader('X-Cache', 'HIT');
    res.json(cached);
    return;
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { slug },
    include: { settings: true },
  });
  if (!restaurant || !restaurant.isActive) {
    res.status(404).json({ success: false, error: 'Restaurant not found' });
    return;
  }

  const categories = await prisma.category.findMany({
    where: { restaurantId: restaurant.id, isActive: true },
    orderBy: { sortOrder: 'asc' },
    include: {
      menuItems: {
        where: { isAvailable: true },
        orderBy: [{ isPopular: 'desc' }, { nameFr: 'asc' }],
      },
    },
  });

  const theme = (restaurant.settings?.themePreset ?? 'DARK_GOLD') as string;
  const { settings: _s, ...restaurantData } = restaurant;
  const mapped = categories.map(({ menuItems, ...cat }) => ({ ...cat, items: menuItems }));
  const payload = { success: true, data: { restaurant: restaurantData, categories: mapped, theme } };

  await setCache(slugKey(slug), payload);
  res.setHeader('X-Cache', 'MISS');
  res.setHeader('Cache-Control', `public, max-age=${MENU_TTL}`);
  res.json(payload);
}

export async function createMenuItem(req: Request, res: Response): Promise<void> {
  const data = CreateMenuItemSchema.parse(req.body);
  const item = await prisma.menuItem.create({
    data: { ...data, restaurantId: req.params.restaurantId },
  });
  await invalidateMenuCache(req.params.restaurantId);
  res.status(201).json({ success: true, data: item });
}

export async function updateMenuItem(req: Request, res: Response): Promise<void> {
  const data = CreateMenuItemSchema.partial().parse(req.body);
  const item = await prisma.menuItem.update({ where: { id: req.params.id }, data });
  await invalidateMenuCache(item.restaurantId);
  res.json({ success: true, data: item });
}

export async function toggleAvailability(req: Request, res: Response): Promise<void> {
  const existing = await prisma.menuItem.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    res.status(404).json({ success: false, error: 'Menu item not found' });
    return;
  }

  const item = await prisma.menuItem.update({
    where: { id: req.params.id },
    data: { isAvailable: !existing.isAvailable },
  });

  await invalidateMenuCache(item.restaurantId);
  emitMenuItemAvailabilityChanged(item.restaurantId, item);
  res.json({ success: true, data: item });
}

export async function deleteMenuItem(req: Request, res: Response): Promise<void> {
  const item = await prisma.menuItem.delete({ where: { id: req.params.id } });
  await invalidateMenuCache(item.restaurantId);
  res.json({ success: true, data: null });
}

// Admin: all items regardless of availability/isActive
export async function getAdminMenu(req: Request, res: Response): Promise<void> {
  const categories = await prisma.category.findMany({
    where: { restaurantId: req.params.restaurantId },
    orderBy: { sortOrder: 'asc' },
    include: { menuItems: { orderBy: [{ isPopular: 'desc' }, { nameFr: 'asc' }] } },
  });
  const mapped = categories.map(({ menuItems, ...cat }) => ({ ...cat, items: menuItems }));
  res.json({ success: true, data: { categories: mapped } });
}
