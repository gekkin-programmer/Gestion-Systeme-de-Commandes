import type { Request, Response, NextFunction } from 'express';

/**
 * Ensures ADMIN/STAFF can only access data from their own hotel.
 * SUPER_ADMIN bypasses this check.
 *
 * Usage: router.get('/:hotelId/...', authenticate, requireHotelAccess('hotelId'), ...)
 */
export function requireHotelAccess(paramName = 'hotelId') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    if (user.role === 'SUPER_ADMIN') {
      next();
      return;
    }

    const targetHotelId = req.params[paramName];
    if (!targetHotelId) {
      res.status(400).json({ success: false, error: 'Missing hotel ID' });
      return;
    }

    if (user.hotelId !== targetHotelId) {
      res.status(403).json({ success: false, error: 'Access denied to this hotel' });
      return;
    }

    next();
  };
}
