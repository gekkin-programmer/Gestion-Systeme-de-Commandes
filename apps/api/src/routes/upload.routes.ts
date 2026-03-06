import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import { multerUpload, uploadImage } from '../controllers/upload.controller';

const router = Router();

router.post('/image', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), multerUpload.single('image'), uploadImage);

export default router;
