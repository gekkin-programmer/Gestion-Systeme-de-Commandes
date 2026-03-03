import { useAuthStore } from '@/store/authStore';

export function getStoredAccessToken(): string | null {
  return useAuthStore.getState().accessToken;
}

export function isStaff(role?: string): boolean {
  return role === 'STAFF' || role === 'ADMIN' || role === 'SUPER_ADMIN';
}

export function isAdmin(role?: string): boolean {
  return role === 'ADMIN' || role === 'SUPER_ADMIN';
}

export function isSuperAdmin(role?: string): boolean {
  return role === 'SUPER_ADMIN';
}
