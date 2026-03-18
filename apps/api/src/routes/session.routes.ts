import { Router } from 'express';
import * as ctrl from '../controllers/session.controller';
import { sessionRateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/start', sessionRateLimiter, ctrl.startSession);
router.get('/:token', ctrl.getSession);

export default router;
