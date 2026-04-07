import type { Role, ServiceType } from '@repo/shared';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: Role;
        hotelId: string | null;
        departmentType: ServiceType | null;
      };
    }
  }
}
