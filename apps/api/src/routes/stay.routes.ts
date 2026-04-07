import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import * as stay from '../controllers/stay.controller';

const router = Router();

router.post('/start', stay.startStay);   // public
router.get('/:token', stay.getStay);      // public
router.post('/:token/checkout', authenticate, requireRole('STAFF', 'ADMIN', 'SUPER_ADMIN'), stay.checkoutStay);

export default router;
