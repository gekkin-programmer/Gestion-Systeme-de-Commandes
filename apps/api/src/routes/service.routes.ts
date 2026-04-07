import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import { requireHotelAccess } from '../middleware/requireHotelAccess';
import * as svc from '../controllers/service.controller';

const router = Router();

// Public catalog endpoints (mobile app)
router.get('/hotel/:hotelId', svc.getServiceCatalog);
router.get('/hotel/:hotelId/dept/:type', svc.getDepartmentCatalog);
// Admin catalog (includes unavailable items)
router.get('/hotel/:hotelId/admin', authenticate, requireHotelAccess('hotelId'), svc.getAdminServiceCatalog);

// Service item management
router.post('/hotel/:hotelId/items', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), requireHotelAccess('hotelId'), svc.createServiceItem);
router.patch('/items/:id', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), svc.updateServiceItem);
router.patch('/items/:id/availability', authenticate, requireRole('ADMIN', 'STAFF'), svc.toggleServiceItemAvailability);
router.delete('/items/:id', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), svc.deleteServiceItem);

export default router;
