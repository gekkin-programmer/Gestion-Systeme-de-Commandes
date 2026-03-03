import { Router } from 'express';
import * as ctrl from '../controllers/session.controller';

const router = Router();

router.post('/start', ctrl.startSession);
router.get('/:token', ctrl.getSession);

export default router;
