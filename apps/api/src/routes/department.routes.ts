import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import { requireHotelAccess } from '../middleware/requireHotelAccess';
import * as dept from '../controllers/department.controller';

const router = Router();

router.get('/hotel/:hotelId', authenticate, requireHotelAccess('hotelId'), dept.listDepartments);
router.post('/hotel/:hotelId', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), requireHotelAccess('hotelId'), dept.createDepartment);
router.patch('/:id', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), dept.updateDepartment);
router.delete('/:id', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), dept.deleteDepartment);

export default router;
