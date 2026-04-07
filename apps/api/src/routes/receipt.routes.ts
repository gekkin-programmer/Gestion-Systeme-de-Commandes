import { Router } from 'express';
import * as receipt from '../controllers/receipt.controller';

const router = Router();

router.get('/:requestId', receipt.downloadReceipt);

export default router;
