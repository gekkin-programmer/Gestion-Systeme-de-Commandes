'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

export function useAuth() {
  const { user, isAuthenticated, accessToken, setAuth, clearAuth } = useAuthStore();
  const router = useRouter();

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    const { accessToken: token, user: userData } = data.data;
    setAuth(userData, token);
    return userData;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      clearAuth();
      router.push('/fr/login');
    }
  };

  return { user, isAuthenticated, accessToken, login, logout };
}
