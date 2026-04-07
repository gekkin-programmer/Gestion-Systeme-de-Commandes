import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import { requireHotelAccess } from '../middleware/requireHotelAccess';
import * as room from '../controllers/room.controller';

const router = Router();

router.get('/:hotelId/occupancy', authenticate, requireHotelAccess('hotelId'), room.getRoomOccupancy);
router.get('/:hotelId', authenticate, requireHotelAccess('hotelId'), room.listRooms);
router.post('/:hotelId', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), requireHotelAccess('hotelId'), room.createRoom);
router.patch('/:hotelId/:id', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), requireHotelAccess('hotelId'), room.updateRoom);
router.delete('/:hotelId/:id', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), requireHotelAccess('hotelId'), room.deleteRoom);
router.post('/:hotelId/:id/qr', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), requireHotelAccess('hotelId'), room.generateRoomQR);
router.get('/:hotelId/:id/qr/download', authenticate, requireHotelAccess('hotelId'), room.downloadRoomQR);

export default router;
