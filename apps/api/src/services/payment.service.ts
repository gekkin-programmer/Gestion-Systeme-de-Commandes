import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../config/database';
import { PaymentMethod, PaymentStatus } from '@prisma/client';

/**
 * Mock Mobile Money payment initiation.
 * In production, replace with actual MTN MoMo / Orange Money API calls.
 */
export async function initiateMobileMoneyPayment(params: {
  requestId: string;
  method: PaymentMethod;
  amount: number;
  phone: string;
}): Promise<{ transactionRef: string; status: PaymentStatus }> {
  // Simulate API call delay
  await new Promise((r) => setTimeout(r, 500));

  const transactionRef = `MOCK-${params.method.slice(0, 3)}-${uuidv4().slice(0, 8).toUpperCase()}`;

  return {
    transactionRef,
    status: PaymentStatus.PENDING_VERIFICATION,
  };
}

/**
 * Mock callback that simulates MoMo webhook.
 */
export async function simulatePaymentCallback(
  requestId: string,
  simulate: 'success' | 'failure' = 'success',
): Promise<void> {
  const status = simulate === 'success' ? PaymentStatus.PAID : PaymentStatus.FAILED;

  await prisma.payment.update({
    where: { requestId },
    data: {
      status,
      confirmedAt: simulate === 'success' ? new Date() : null,
    },
  });
}

export function generateRequestNumber(): string {
  const now = new Date();
  const date = now.toISOString().slice(2, 10).replace(/-/g, '');
  const seq = Math.floor(Math.random() * 999)
    .toString()
    .padStart(3, '0');
  return `REQ-${date}-${seq}`;
}
