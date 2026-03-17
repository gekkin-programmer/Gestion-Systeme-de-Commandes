import type { Request, Response } from 'express';
import { prisma } from '../config/database';
import { cloudinary } from '../config/cloudinary';
import { redis } from '../config/redis';
import { CreateRestaurantSchema, UpdateRestaurantSettingsSchema } from '@repo/shared';

export async function listRestaurants(_req: Request, res: Response): Promise<void> {
  const restaurants = await prisma.restaurant.findMany({
    orderBy: { createdAt: 'desc' },
  });
  res.json({ success: true, data: restaurants });
}

export async function getRestaurant(req: Request, res: Response): Promise<void> {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: req.params.id },
    include: { settings: true },
  });
  if (!restaurant) {
    res.status(404).json({ success: false, error: 'Restaurant not found' });
    return;
  }
  res.json({ success: true, data: restaurant });
}

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

export async function updateRestaurant(req: Request, res: Response): Promise<void> {
  const data = CreateRestaurantSchema.partial().parse(req.body);
  const restaurant = await prisma.restaurant.update({
    where: { id: req.params.id },
    data,
  });
  res.json({ success: true, data: restaurant });
}

export async function uploadLogo(req: Request, res: Response): Promise<void> {
  if (!req.file) {
    res.status(400).json({ success: false, error: 'No file uploaded' });
    return;
  }

  let logoUrl: string;

  // Try Cloudinary if configured
  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    try {
      const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'restaurant-logos' },
          (err, result) => {
            if (err || !result) return reject(err ?? new Error('Upload failed'));
            resolve(result);
          },
        );
        stream.end(req.file!.buffer);
      });
      logoUrl = uploadResult.secure_url;
    } catch {
      // Fall through to local
      logoUrl = await saveLogoLocally(req);
    }
  } else {
    logoUrl = await saveLogoLocally(req);
  }

  const restaurant = await prisma.restaurant.update({
    where: { id: req.params.id },
    data: { logoUrl },
  });
  res.json({ success: true, data: { logoUrl: restaurant.logoUrl } });
}

async function saveLogoLocally(req: Request): Promise<string> {
  const fs   = await import('fs');
  const path = await import('path');
  const UPLOAD_DIR = path.resolve(process.cwd(), '../../uploads');
  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const ext      = req.file!.mimetype.split('/')[1] ?? 'jpg';
  const filename = `logo-${Date.now()}.${ext}`;
  fs.writeFileSync(path.join(UPLOAD_DIR, filename), req.file!.buffer);
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}/api/v1/uploads/${filename}`;
}

export async function updateSettings(req: Request, res: Response): Promise<void> {
  const data = UpdateRestaurantSettingsSchema.parse(req.body);
  const settings = await prisma.restaurantSettings.upsert({
    where: { restaurantId: req.params.id },
    create: { restaurantId: req.params.id, ...data },
    update: data,
  });

  // Invalidate menu cache so theme changes are reflected immediately
  const restaurant = await prisma.restaurant.findUnique({ where: { id: req.params.id }, select: { slug: true } });
  if (restaurant) {
    const keys = [`menu:id:${req.params.id}`, `menu:slug:${restaurant.slug}`];
    try { await redis.del(...keys); } catch (_) {}
  }

  res.json({ success: true, data: settings });
}

export async function getRestaurantStats(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [totalOrders, revenueResult, cancelledOrders] = await Promise.all([
    prisma.order.count({
      where: { restaurantId: id, createdAt: { gte: today, lt: tomorrow }, status: { not: 'CANCELLED' } },
    }),
    prisma.order.aggregate({
      where: { restaurantId: id, createdAt: { gte: today, lt: tomorrow }, status: 'SERVED' },
      _sum: { totalAmount: true },
    }),
    prisma.order.count({
      where: { restaurantId: id, createdAt: { gte: today, lt: tomorrow }, status: 'CANCELLED' },
    }),
  ]);

  const totalRevenue = revenueResult._sum.totalAmount ?? 0;

  res.json({
    success: true,
    data: {
      date: today.toISOString().split('T')[0],
      totalOrders,
      totalRevenue,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      cancelledOrders,
    },
  });
}
