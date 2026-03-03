import { Router } from 'express';
import * as ctrl from '../controllers/restaurant.controller';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import { requireRestaurantAccess } from '../middleware/requireRestaurantAccess';

const router = Router();

router.get(
  '/:id',
  authenticate,
  requireRestaurantAccess('id'),
  ctrl.getRestaurant,
);
router.patch(
  '/:id',
  authenticate,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  requireRestaurantAccess('id'),
  ctrl.updateRestaurant,
);
router.patch(
  '/:id/settings',
  authenticate,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  requireRestaurantAccess('id'),
  ctrl.updateSettings,
);
router.get(
  '/:id/stats/today',
  authenticate,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  requireRestaurantAccess('id'),
  ctrl.getRestaurantStats,
);

export default router;
