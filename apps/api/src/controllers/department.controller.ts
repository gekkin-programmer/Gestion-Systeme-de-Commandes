import type { Request, Response } from 'express';
import { prisma } from '../config/database';
import { CreateServiceDepartmentSchema } from '@repo/shared';

export async function listDepartments(req: Request, res: Response): Promise<void> {
  const departments = await prisma.serviceDepartment.findMany({
    where: { hotelId: req.params.hotelId },
    orderBy: { sortOrder: 'asc' },
  });
  res.json({ success: true, data: departments });
}

export async function createDepartment(req: Request, res: Response): Promise<void> {
  const data = CreateServiceDepartmentSchema.parse(req.body);
  try {
    const dept = await prisma.serviceDepartment.create({
      data: { ...data, hotelId: req.params.hotelId },
    });
    res.status(201).json({ success: true, data: dept });
  } catch (err: unknown) {
    const isPrismaUnique = (err as { code?: string })?.code === 'P2002';
    if (isPrismaUnique) {
      res.status(409).json({ success: false, error: 'Ce département existe déjà pour cet hôtel.' });
    } else {
      throw err;
    }
  }
}

export async function updateDepartment(req: Request, res: Response): Promise<void> {
  const data = CreateServiceDepartmentSchema.partial().parse(req.body);
  const dept = await prisma.serviceDepartment.update({ where: { id: req.params.id }, data });
  res.json({ success: true, data: dept });
}

export async function deleteDepartment(req: Request, res: Response): Promise<void> {
  await prisma.serviceDepartment.delete({ where: { id: req.params.id } });
  res.json({ success: true, data: null });
}
