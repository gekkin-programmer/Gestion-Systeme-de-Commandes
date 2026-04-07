import type { Request, Response } from 'express';
import { prisma } from '../config/database';
import { InitiatePaymentSchema } from '@repo/shared';
import { initiateMobileMoneyPayment, simulatePaymentCallback } from '../services/payment.service';
import { emitPaymentStatusChanged, emitRequestStatusChanged } from '../services/notification.service';
import { PaymentMethod, PaymentStatus } from '@prisma/client';

export async function initiatePayment(req: Request, res: Response): Promise<void> {
  const { requestId, method, mobileMoneyPhone } = InitiatePaymentSchema.parse(req.body);

  const request = await prisma.serviceRequest.findUnique({
    where: { id: requestId },
    include: { payment: true, roomStay: true },
  });

  if (!request) {
    res.status(404).json({ success: false, error: 'Request not found' });
    return;
  }

  if (request.payment?.status === PaymentStatus.PAID) {
    res.status(400).json({ success: false, error: 'Request already paid' });
    return;
  }
  if (request.payment?.status === PaymentStatus.PENDING_VERIFICATION) {
    res.status(200).json({ success: true, data: request.payment, message: 'Payment already pending' });
    return;
  }

  let transactionRef: string | undefined;
  let status: PaymentStatus = PaymentStatus.PENDING_VERIFICATION;

  if (method === PaymentMethod.HOTEL_BILL) {
    // Hotel bill: synchronous — mark as PAID immediately
    status = PaymentStatus.PAID;
  } else {
    const result = await initiateMobileMoneyPayment({
      requestId,
      method,
      amount: request.totalAmount,
      phone: mobileMoneyPhone ?? '',
    });
    transactionRef = result.transactionRef;
    status = result.status;
  }

  const payment = await prisma.payment.upsert({
    where: { requestId },
    create: {
      requestId,
      method,
      amount: request.totalAmount,
      mobileMoneyPhone,
      transactionRef,
      status,
      confirmedAt: status === PaymentStatus.PAID ? new Date() : null,
    },
    update: {
      method,
      mobileMoneyPhone,
      transactionRef,
      status,
      confirmedAt: status === PaymentStatus.PAID ? new Date() : null,
    },
  });

  // If HOTEL_BILL, also move request to DELIVERED
  if (method === PaymentMethod.HOTEL_BILL) {
    const updated = await prisma.serviceRequest.update({
      where: { id: requestId },
      data: { status: 'DELIVERED' },
      include: { items: true, payment: true, roomStay: { include: { room: true } } },
    });
    emitRequestStatusChanged(request.hotelId, request.department, request.roomStayId, updated);
  }

  emitPaymentStatusChanged(request.roomStayId, payment);

  res.status(201).json({ success: true, data: payment });
}

export async function mockMoMoCallback(req: Request, res: Response): Promise<void> {
  const { requestId } = req.params;
  const simulate = (req.query.simulate as string) === 'failure' ? 'failure' : 'success';

  const payment = await prisma.payment.findUnique({
    where: { requestId },
    include: { request: { include: { roomStay: true } } },
  });

  if (!payment) {
    res.status(404).json({ success: false, error: 'Payment not found' });
    return;
  }

  await simulatePaymentCallback(requestId, simulate);

  const updated = await prisma.payment.findUnique({ where: { requestId } });
  emitPaymentStatusChanged(payment.request.roomStayId, updated);

  res.json({ success: true, data: { simulate, status: updated?.status } });
}

export async function refundPayment(req: Request, res: Response): Promise<void> {
  const payment = await prisma.payment.findUnique({
    where: { requestId: req.params.requestId },
    include: { request: { include: { roomStay: true } } },
  });

  if (!payment) {
    res.status(404).json({ success: false, error: 'Payment not found' });
    return;
  }

  if (req.user?.role !== 'SUPER_ADMIN' && payment.request.hotelId !== req.user?.hotelId) {
    res.status(403).json({ success: false, error: 'Access denied to this payment' });
    return;
  }

  if (payment.status !== PaymentStatus.PAID) {
    res.status(400).json({ success: false, error: 'Only paid requests can be refunded' });
    return;
  }

  const updatedPayment = await prisma.payment.update({
    where: { id: payment.id },
    data: { status: PaymentStatus.REFUNDED },
  });

  const cancelledRequest = await prisma.serviceRequest.update({
    where: { id: payment.requestId },
    data: { status: 'CANCELLED' },
    include: { items: true, payment: true, roomStay: { include: { room: true } } },
  });

  emitPaymentStatusChanged(payment.request.roomStayId, updatedPayment);
  emitRequestStatusChanged(
    payment.request.hotelId,
    payment.request.department,
    payment.request.roomStayId,
    cancelledRequest,
  );

  res.json({ success: true, data: updatedPayment });
}
