import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import type { AuthUser, GuestSession } from '../types';

// ─── SecureStore adapter for Zustand persist ─────────────────────────────────
// AsyncStorage v3 requires a native build (crashes in Expo Go).
// SecureStore is available in Expo Go and handles small auth payloads fine.

const secureStorage = {
  getItem: async (key: string) => {
    return await SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string) => {
    await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string) => {
    await SecureStore.deleteItemAsync(key);
  },
};

// ─── Store ────────────────────────────────────────────────────────────────────

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  guestSession: GuestSession | null;
  isHydrated: boolean;

  setAuth: (user: AuthUser, token: string) => Promise<void>;
  setGuestSession: (session: GuestSession) => void;
  clearAuth: () => Promise<void>;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      guestSession: null,
      isHydrated: false,

      setAuth: async (user, token) => {
        await SecureStore.setItemAsync('accessToken', token);
        set({ user, accessToken: token, guestSession: null });
      },

      setGuestSession: (session) => {
        set({ guestSession: session, user: null, accessToken: null });
      },

      clearAuth: async () => {
        await SecureStore.deleteItemAsync('accessToken');
        set({ user: null, accessToken: null, guestSession: null });
      },

      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'pms-auth',
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({
        user: state.user,
        guestSession: state.guestSession,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
