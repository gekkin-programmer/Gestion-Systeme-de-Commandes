import { Router } from 'express';
import * as ctrl from '../controllers/table.controller';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import { requireRestaurantAccess } from '../middleware/requireRestaurantAccess';

const router = Router();

router.get('/:restaurantId/occupancy', authenticate, requireRole('ADMIN', 'SUPER_ADMIN', 'STAFF'), requireRestaurantAccess('restaurantId'), ctrl.getOccupancy);
router.get('/:restaurantId',           authenticate, requireRole('ADMIN', 'SUPER_ADMIN', 'STAFF'), requireRestaurantAccess('restaurantId'), ctrl.listTables);
router.post('/:restaurantId',      authenticate, requireRole('ADMIN', 'SUPER_ADMIN'),          requireRestaurantAccess('restaurantId'), ctrl.createTable);
router.patch('/:restaurantId/:id', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'),          requireRestaurantAccess('restaurantId'), ctrl.updateTable);
router.delete('/:restaurantId/:id',authenticate, requireRole('ADMIN', 'SUPER_ADMIN'),          requireRestaurantAccess('restaurantId'), ctrl.deleteTable);
router.post('/:restaurantId/:id/qr',           authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), requireRestaurantAccess('restaurantId'), ctrl.generateQR);
router.get('/:restaurantId/:id/qr/download',   authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), requireRestaurantAccess('restaurantId'), ctrl.downloadQR);

export default router;
