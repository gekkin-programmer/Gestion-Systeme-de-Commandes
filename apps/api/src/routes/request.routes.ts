import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import { requireHotelAccess } from '../middleware/requireHotelAccess';
import * as request from '../controllers/request.controller';

const router = Router();

router.post('/', request.createServiceRequest);            // public
router.get('/:id/status', request.getRequestStatus);       // public
router.patch('/:id/status', authenticate, requireRole('STAFF', 'ADMIN', 'SUPER_ADMIN'), request.updateRequestStatus);
router.get('/hotel/:hotelId', authenticate, requireRole('STAFF', 'ADMIN', 'SUPER_ADMIN'), requireHotelAccess('hotelId'), request.listHotelRequests);

export default router;
