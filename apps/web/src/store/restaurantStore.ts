import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ThemePreset } from '@repo/shared';

interface RestaurantBrand {
  restaurantName: string | null;
  logoUrl:        string | null;
  themePreset:    ThemePreset | null;
  setBrand: (data: { name: string; logoUrl: string | null; themePreset: ThemePreset }) => void;
  clearBrand: () => void;
}

export const useRestaurantStore = create<RestaurantBrand>()(
  persist(
    (set) => ({
      restaurantName: null,
      logoUrl:        null,
      themePreset:    null,
      setBrand: (data) => set({ restaurantName: data.name, logoUrl: data.logoUrl, themePreset: data.themePreset }),
      clearBrand: () => set({ restaurantName: null, logoUrl: null, themePreset: null }),
    }),
    {
      name:    'restaurant-brand',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
