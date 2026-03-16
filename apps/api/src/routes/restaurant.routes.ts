import { Router } from 'express';
import * as ctrl from '../controllers/restaurant.controller';
import * as staffCtrl from '../controllers/staff.controller';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import { requireRestaurantAccess } from '../middleware/requireRestaurantAccess';
import { upload } from '../middleware/upload';

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
router.post(
  '/:id/logo',
  authenticate,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  requireRestaurantAccess('id'),
  upload.single('logo'),
  ctrl.uploadLogo,
);
router.get(
  '/:id/stats/today',
  authenticate,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  requireRestaurantAccess('id'),
  ctrl.getRestaurantStats,
);

// Staff management (Admin/Super-Admin only)
router.get(
  '/:id/staff',
  authenticate,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  requireRestaurantAccess('id'),
  staffCtrl.listStaff,
);
router.post(
  '/:id/staff',
  authenticate,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  requireRestaurantAccess('id'),
  staffCtrl.createStaff,
);
router.patch(
  '/:id/staff/:userId/toggle',
  authenticate,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  requireRestaurantAccess('id'),
  staffCtrl.toggleStaff,
);
router.delete(
  '/:id/staff/:userId',
  authenticate,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  requireRestaurantAccess('id'),
  staffCtrl.deleteStaff,
);

export default router;
