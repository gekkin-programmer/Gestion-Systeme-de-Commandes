import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import * as payment from '../controllers/payment.controller';

const router = Router();

router.post('/initiate', payment.initiatePayment);
router.post('/callback/mock/:requestId', payment.mockMoMoCallback);
router.post('/:requestId/refund', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), payment.refundPayment);

export default router;
