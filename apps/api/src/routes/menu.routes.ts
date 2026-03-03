import { Router } from 'express';
import * as ctrl from '../controllers/menu.controller';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';

const router = Router();

// Public: Get full menu by restaurant slug (used by QR flow)
router.get('/slug/:slug', ctrl.getMenuBySlug);

// Admin: Get full menu including unavailable items
router.get('/:restaurantId/admin', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), ctrl.getAdminMenu);

// Public: Get full menu by restaurant ID
router.get('/:restaurantId', ctrl.getMenu);

// Admin: Categories
router.post('/:restaurantId/categories', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), ctrl.createCategory);
router.patch('/categories/:id', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), ctrl.updateCategory);
router.delete('/categories/:id', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), ctrl.deleteCategory);

// Admin: Menu Items
router.post('/:restaurantId/items', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), ctrl.createMenuItem);
router.patch('/items/:id', authenticate, requireRole('ADMIN', 'SUPER_ADMIN', 'STAFF'), ctrl.updateMenuItem);
router.patch('/items/:id/availability', authenticate, requireRole('ADMIN', 'SUPER_ADMIN', 'STAFF'), ctrl.toggleAvailability);
router.delete('/items/:id', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), ctrl.deleteMenuItem);

export default router;
