import type { Request, Response, NextFunction } from 'express';

/**
 * Ensures ADMIN/STAFF can only access data from their own restaurant.
 * SUPER_ADMIN bypasses this check.
 *
 * Usage: router.get('/:restaurantId/...', authenticate, requireRestaurantAccess('restaurantId'), ...)
 */
export function requireRestaurantAccess(paramName = 'restaurantId') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    // Super admin can access any restaurant
    if (user.role === 'SUPER_ADMIN') {
      next();
      return;
    }

    const targetRestaurantId = req.params[paramName];
    if (!targetRestaurantId) {
      res.status(400).json({ success: false, error: 'Missing restaurant ID' });
      return;
    }

    if (user.restaurantId !== targetRestaurantId) {
      res.status(403).json({ success: false, error: 'Access denied to this restaurant' });
      return;
    }

    next();
  };
}
