import { Router } from 'express';
import * as ctrl from '../controllers/order.controller';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import { requireRestaurantAccess } from '../middleware/requireRestaurantAccess';
import { orderRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Client: Create order (no auth — session token validates)
router.post('/', orderRateLimiter, ctrl.createOrder);

// Client: Poll order status & history
router.get('/history', ctrl.getOrderHistory);
router.get('/:id/status', ctrl.getOrderStatus);

// Staff/Admin: List & manage orders (with multi-tenancy isolation)
router.get(
  '/restaurant/:restaurantId',
  authenticate,
  requireRole('STAFF', 'ADMIN', 'SUPER_ADMIN'),
  requireRestaurantAccess('restaurantId'),
  ctrl.listRestaurantOrders,
);
router.patch(
  '/:id/status',
  authenticate,
  requireRole('STAFF', 'ADMIN', 'SUPER_ADMIN'),
  ctrl.updateOrderStatus,
);

export default router;
