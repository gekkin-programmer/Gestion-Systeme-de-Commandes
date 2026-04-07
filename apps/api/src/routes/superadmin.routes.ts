import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import * as superadmin from '../controllers/superadmin.controller';

const router = Router();

router.use(authenticate, requireRole('SUPER_ADMIN'));

router.get('/hotels', superadmin.listAllHotels);
router.post('/hotels', superadmin.createHotel);
router.patch('/hotels/:id/toggle', superadmin.toggleHotelActive);
router.get('/users', superadmin.listUsers);
router.post('/users', superadmin.createAdminUser);
router.patch('/users/:id/toggle', superadmin.toggleUserActive);

export default router;
