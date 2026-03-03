import { Router } from 'express';
import * as ctrl from '../controllers/superadmin.controller';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';

const router = Router();

router.use(authenticate, requireRole('SUPER_ADMIN'));

router.get('/restaurants', ctrl.listAllRestaurants);
router.post('/restaurants', ctrl.createRestaurant);
router.patch('/restaurants/:id/toggle', ctrl.toggleRestaurantActive);
router.get('/users', ctrl.listUsers);
router.post('/users', ctrl.createAdminUser);
router.patch('/users/:id/toggle', ctrl.toggleUserActive);

export default router;
