import { Router } from 'express';
import * as ctrl from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import { paymentRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Client: initiate payment
router.post('/initiate', paymentRateLimiter, ctrl.initiatePayment);

// Customer: confirm cash receipt (plate delivered + cash collected)
router.post('/:orderId/cash-receipt', paymentRateLimiter, ctrl.confirmCashReceipt);

// Staff: confirm cash (server-side only — client can never self-confirm)
router.post(
  '/:orderId/confirm-cash',
  authenticate,
  requireRole('STAFF', 'ADMIN', 'SUPER_ADMIN'),
  ctrl.confirmCash,
);

// Mock MoMo webhook (rate-limited)
router.post('/callback/mock/:orderId', paymentRateLimiter, ctrl.mockMoMoCallback);

// Staff/Admin: refund a paid payment and cancel the order
router.post(
  '/:orderId/refund',
  authenticate,
  requireRole('STAFF', 'ADMIN', 'SUPER_ADMIN'),
  ctrl.refundPayment,
);

export default router;
