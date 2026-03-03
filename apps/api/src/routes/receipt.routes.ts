import { Router } from 'express';
import * as ctrl from '../controllers/receipt.controller';

const router = Router();

router.get('/:orderId', ctrl.downloadReceipt);

export default router;
