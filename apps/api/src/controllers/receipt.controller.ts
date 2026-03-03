import type { Request, Response } from 'express';
import { prisma } from '../config/database';
import { generateReceiptPDF } from '../services/pdf.service';

export async function downloadReceipt(req: Request, res: Response): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: req.params.orderId },
    include: {
      items: true,
      payment: true,
      tableSession: { include: { table: true } },
    },
  });

  if (!order) {
    res.status(404).json({ success: false, error: 'Order not found' });
    return;
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: order.restaurantId },
  });

  if (!restaurant) {
    res.status(404).json({ success: false, error: 'Restaurant not found' });
    return;
  }

  const pdfBuffer = await generateReceiptPDF(order as any, restaurant);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="recu-${order.orderNumber}.pdf"`,
  );
  res.send(pdfBuffer);
}
