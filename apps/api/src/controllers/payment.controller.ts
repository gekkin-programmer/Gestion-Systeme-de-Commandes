import type { Request, Response } from 'express';
import { prisma } from '../config/database';
import { InitiatePaymentSchema } from '@repo/shared';
import { initiateMobileMoneyPayment, simulatePaymentCallback } from '../services/payment.service';
import { emitPaymentStatusChanged, emitOrderStatusChanged } from '../services/notification.service';
import { PaymentMethod, PaymentStatus } from '@prisma/client';

export async function initiatePayment(req: Request, res: Response): Promise<void> {
  const { orderId, method, mobileMoneyPhone } = InitiatePaymentSchema.parse(req.body);

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payment: true, tableSession: true },
  });

  if (!order) {
    res.status(404).json({ success: false, error: 'Order not found' });
    return;
  }

  // Idempotency: block any re-attempt if already paid or pending
  if (order.payment?.status === PaymentStatus.PAID) {
    res.status(400).json({ success: false, error: 'Order already paid' });
    return;
  }
  if (order.payment?.status === PaymentStatus.PENDING_VERIFICATION) {
    // Return existing pending payment instead of creating a duplicate
    res.status(200).json({ success: true, data: order.payment, message: 'Payment already pending' });
    return;
  }

  let transactionRef: string | undefined;
  let status: PaymentStatus = PaymentStatus.PENDING_VERIFICATION;

  if (method === PaymentMethod.CASH) {
    status = PaymentStatus.PENDING_VERIFICATION;
  } else {
    const result = await initiateMobileMoneyPayment({
      orderId,
      method,
      amount: order.totalAmount,
      phone: mobileMoneyPhone ?? '',
    });
    transactionRef = result.transactionRef;
    status = result.status;
  }

  const payment = await prisma.payment.upsert({
    where: { orderId },
    create: {
      orderId,
      method,
      amount: order.totalAmount,
      mobileMoneyPhone,
      transactionRef,
      status,
    },
    update: {
      method,
      mobileMoneyPhone,
      transactionRef,
      status,
    },
  });

  res.status(201).json({ success: true, data: payment });
}

export async function confirmCashReceipt(req: Request, res: Response): Promise<void> {
  const { sessionToken } = req.body as { sessionToken?: string };

  if (!sessionToken) {
    res.status(400).json({ success: false, error: 'sessionToken required' });
    return;
  }

  const payment = await prisma.payment.findUnique({
    where: { orderId: req.params.orderId },
    include: { order: { include: { tableSession: true } } },
  });

  if (!payment) {
    res.status(404).json({ success: false, error: 'Payment not found' });
    return;
  }

  // Validate ownership: sessionToken must match the order's session
  if (payment.order.tableSession.sessionToken !== sessionToken) {
    res.status(403).json({ success: false, error: 'Unauthorized' });
    return;
  }

  // Only cash payments can be receipted by the customer
  if (payment.method !== PaymentMethod.CASH) {
    res.status(400).json({ success: false, error: 'Only cash payments can be confirmed this way' });
    return;
  }

  if (payment.status === PaymentStatus.PAID) {
    res.status(400).json({ success: false, error: 'Already confirmed' });
    return;
  }

  const updated = await prisma.payment.update({
    where: { id: payment.id },
    data: { status: PaymentStatus.PAID, confirmedAt: new Date() },
  });

  const servedOrder = await prisma.order.update({
    where: { id: payment.orderId },
    data: { status: 'SERVED' },
    include: { items: true, payment: true, tableSession: { include: { table: true } } },
  });

  emitPaymentStatusChanged(payment.order.tableSessionId, updated);
  emitOrderStatusChanged(payment.order.restaurantId, payment.order.tableSessionId, servedOrder);

  res.json({ success: true, data: updated });
}

export async function confirmCash(req: Request, res: Response): Promise<void> {
  const payment = await prisma.payment.findUnique({
    where: { orderId: req.params.orderId },
    include: { order: { include: { tableSession: true } } },
  });

  if (!payment) {
    res.status(404).json({ success: false, error: 'Payment not found' });
    return;
  }

  const updated = await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: PaymentStatus.PAID,
      confirmedAt: new Date(),
    },
  });

  // Mark order as served once paid
  await prisma.order.update({
    where: { id: payment.orderId },
    data: { status: 'SERVED' },
  });

  emitPaymentStatusChanged(payment.order.tableSessionId, updated);

  res.json({ success: true, data: updated });
}

export async function mockMoMoCallback(req: Request, res: Response): Promise<void> {
  const { orderId } = req.params;
  const simulate = (req.query.simulate as string) === 'failure' ? 'failure' : 'success';

  const payment = await prisma.payment.findUnique({
    where: { orderId },
    include: { order: { include: { tableSession: true } } },
  });

  if (!payment) {
    res.status(404).json({ success: false, error: 'Payment not found' });
    return;
  }

  await simulatePaymentCallback(orderId, simulate);

  const updated = await prisma.payment.findUnique({ where: { orderId } });
  emitPaymentStatusChanged(payment.order.tableSessionId, updated);

  res.json({ success: true, data: { simulate, status: updated?.status } });
}

export async function refundPayment(req: Request, res: Response): Promise<void> {
  const payment = await prisma.payment.findUnique({
    where: { orderId: req.params.orderId },
    include: { order: { include: { tableSession: true } } },
  });

  if (!payment) {
    res.status(404).json({ success: false, error: 'Payment not found' });
    return;
  }

  // Multi-tenancy check: staff/admin can only refund their own restaurant's payments
  if (req.user?.role !== 'SUPER_ADMIN' && payment.order.restaurantId !== req.user?.restaurantId) {
    res.status(403).json({ success: false, error: 'Access denied to this payment' });
    return;
  }

  if (payment.status !== PaymentStatus.PAID) {
    res.status(400).json({ success: false, error: 'Only paid orders can be refunded' });
    return;
  }

  const updatedPayment = await prisma.payment.update({
    where: { id: payment.id },
    data: { status: PaymentStatus.REFUNDED },
  });

  const cancelledOrder = await prisma.order.update({
    where: { id: payment.orderId },
    data: { status: 'CANCELLED' },
    include: { items: true, payment: true, tableSession: { include: { table: true } } },
  });

  emitPaymentStatusChanged(payment.order.tableSessionId, updatedPayment);
  emitOrderStatusChanged(payment.order.restaurantId, payment.order.tableSessionId, cancelledOrder);

  res.json({ success: true, data: updatedPayment });
}
