import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import { requireHotelAccess } from '../middleware/requireHotelAccess';
import { uploadMiddleware } from '../middleware/upload';
import * as hotel from '../controllers/hotel.controller';
import * as staff from '../controllers/staff.controller';

const router = Router();

router.get('/:id', authenticate, hotel.getHotel);
router.patch('/:id', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), hotel.updateHotel);
router.patch('/:id/settings', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), requireHotelAccess('id'), hotel.updateSettings);
router.post('/:id/logo', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), uploadMiddleware.single('logo'), hotel.uploadLogo);
router.get('/:id/stats/today', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), requireHotelAccess('id'), hotel.getHotelStats);

// Staff management
router.get('/:hotelId/staff', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), requireHotelAccess('hotelId'), staff.listStaff);
router.post('/:hotelId/staff', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), requireHotelAccess('hotelId'), staff.createStaff);
router.patch('/:hotelId/staff/:userId/toggle', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), requireHotelAccess('hotelId'), staff.toggleStaff);
router.delete('/:hotelId/staff/:userId', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), requireHotelAccess('hotelId'), staff.deleteStaff);

export default router;
