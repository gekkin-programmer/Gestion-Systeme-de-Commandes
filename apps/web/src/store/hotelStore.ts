'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ThemePreset } from '@repo/shared';

interface HotelBrand {
  hotelName: string | null;
  logoUrl:   string | null;
  themePreset: ThemePreset | null;
  setBrand: (data: { name: string; logoUrl: string | null; themePreset: ThemePreset }) => void;
  clearBrand: () => void;
}

export const useHotelStore = create<HotelBrand>()(
  persist(
    (set) => ({
      hotelName:   null,
      logoUrl:     null,
      themePreset: null,
      setBrand: (data) => set({ hotelName: data.name, logoUrl: data.logoUrl, themePreset: data.themePreset }),
      clearBrand: () => set({ hotelName: null, logoUrl: null, themePreset: null }),
    }),
    {
      name:    'hotel-brand',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);

// Backwards-compat alias
export { useHotelStore as useRestaurantStore };
