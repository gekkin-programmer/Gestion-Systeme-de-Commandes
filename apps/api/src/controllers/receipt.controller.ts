import type { Request, Response } from 'express';
import { prisma } from '../config/database';
import { generateReceiptPDF } from '../services/pdf.service';

export async function downloadReceipt(req: Request, res: Response): Promise<void> {
  const request = await prisma.serviceRequest.findUnique({
    where: { id: req.params.requestId },
    include: {
      items: true,
      payment: true,
      roomStay: { include: { room: true } },
      hotel: true,
    },
  });

  if (!request) {
    res.status(404).json({ success: false, error: 'Request not found' });
    return;
  }

  const pdfBuffer = await generateReceiptPDF(request as any, request.hotel);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="receipt-${request.requestNumber}.pdf"`);
  res.send(pdfBuffer);
}
