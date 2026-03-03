import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserDTO } from '@/types';

interface AuthState {
  user: UserDTO | null;
  accessToken: string | null;
  isAuthenticated: boolean;

  setAuth: (user: UserDTO, accessToken: string) => void;
  clearAuth: () => void;
  setAccessToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      setAuth: (user, accessToken) => set({ user, accessToken, isAuthenticated: true }),

      clearAuth: () => set({ user: null, accessToken: null, isAuthenticated: false }),

      setAccessToken: (token) => set({ accessToken: token }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
