import type { Request, Response } from 'express';
import { prisma } from '../config/database';
import { cloudinary } from '../config/cloudinary';
import { CreateHotelSchema, UpdateHotelSettingsSchema } from '@repo/shared';

export async function listHotels(_req: Request, res: Response): Promise<void> {
  const hotels = await prisma.hotel.findMany({ orderBy: { createdAt: 'desc' } });
  res.json({ success: true, data: hotels });
}

export async function getHotel(req: Request, res: Response): Promise<void> {
  const hotel = await prisma.hotel.findUnique({
    where: { id: req.params.id },
    include: { settings: true },
  });
  if (!hotel) {
    res.status(404).json({ success: false, error: 'Hotel not found' });
    return;
  }
  res.json({ success: true, data: hotel });
}

export async function createHotel(req: Request, res: Response): Promise<void> {
  const data = CreateHotelSchema.parse(req.body);
  const hotel = await prisma.hotel.create({
    data: { ...data, settings: { create: {} } },
    include: { settings: true },
  });
  res.status(201).json({ success: true, data: hotel });
}

export async function updateHotel(req: Request, res: Response): Promise<void> {
  const data = CreateHotelSchema.partial().parse(req.body);
  const hotel = await prisma.hotel.update({ where: { id: req.params.id }, data });
  res.json({ success: true, data: hotel });
}

export async function uploadLogo(req: Request, res: Response): Promise<void> {
  if (!req.file) {
    res.status(400).json({ success: false, error: 'No file uploaded' });
    return;
  }

  let logoUrl: string;

  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    try {
      const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'hotel-logos' },
          (err, result) => {
            if (err || !result) return reject(err ?? new Error('Upload failed'));
            resolve(result);
          },
        );
        stream.end(req.file!.buffer);
      });
      logoUrl = uploadResult.secure_url;
    } catch {
      logoUrl = await saveLogoLocally(req);
    }
  } else {
    logoUrl = await saveLogoLocally(req);
  }

  const hotel = await prisma.hotel.update({ where: { id: req.params.id }, data: { logoUrl } });
  res.json({ success: true, data: { logoUrl: hotel.logoUrl } });
}

async function saveLogoLocally(req: Request): Promise<string> {
  const fs = await import('fs');
  const path = await import('path');
  const UPLOAD_DIR = path.resolve(process.cwd(), '../../uploads');
  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const ext = req.file!.mimetype.split('/')[1] ?? 'jpg';
  const filename = `logo-${Date.now()}.${ext}`;
  fs.writeFileSync(path.join(UPLOAD_DIR, filename), req.file!.buffer);
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}/api/v1/uploads/${filename}`;
}

export async function updateSettings(req: Request, res: Response): Promise<void> {
  const data = UpdateHotelSettingsSchema.parse(req.body);
  const settings = await prisma.hotelSettings.upsert({
    where: { hotelId: req.params.id },
    create: { hotelId: req.params.id, ...data },
    update: data,
  });
  res.json({ success: true, data: settings });
}

export async function getHotelStats(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [totalRequests, revenueResult, cancelledRequests] = await Promise.all([
    prisma.serviceRequest.count({
      where: { hotelId: id, createdAt: { gte: today, lt: tomorrow }, status: { not: 'CANCELLED' } },
    }),
    prisma.serviceRequest.aggregate({
      where: { hotelId: id, createdAt: { gte: today, lt: tomorrow }, status: 'DELIVERED' },
      _sum: { totalAmount: true },
    }),
    prisma.serviceRequest.count({
      where: { hotelId: id, createdAt: { gte: today, lt: tomorrow }, status: 'CANCELLED' },
    }),
  ]);

  const totalRevenue = revenueResult._sum.totalAmount ?? 0;

  const deptStats = await prisma.serviceRequest.groupBy({
    by: ['department'],
    where: { hotelId: id, createdAt: { gte: today, lt: tomorrow }, status: { not: 'CANCELLED' } },
    _count: { id: true },
    _sum: { totalAmount: true },
  });

  res.json({
    success: true,
    data: {
      date: today.toISOString().split('T')[0],
      totalRequests,
      totalRevenue,
      averageRequestValue: totalRequests > 0 ? totalRevenue / totalRequests : 0,
      cancelledRequests,
      byDepartment: deptStats.map((d) => ({
        department: d.department,
        totalRequests: d._count.id,
        totalRevenue: d._sum.totalAmount ?? 0,
      })),
    },
  });
}
