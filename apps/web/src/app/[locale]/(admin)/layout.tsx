'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useHotelStore } from '@/store/hotelStore';
import api from '@/lib/api';
import type { ThemePreset } from '@repo/shared';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuthStore();
  const setBrand = useHotelStore((s) => s.setBrand);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const allowed = isAuthenticated && (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN');
    if (!allowed) {
      const locale = pathname.split('/')[1] ?? 'fr';
      router.replace(`/${locale}/login`);
    } else {
      setChecked(true);
    }
  }, [isAuthenticated, user, router, pathname]);

  // Load hotel brand so ThemeProvider applies correct theme
  useEffect(() => {
    const hotelId = (user as any)?.hotelId;
    if (!hotelId) return;
    api.get(`/hotels/${hotelId}`)
      .then(({ data }) => {
        const h = data.data;
        setBrand({
          name:        h.name ?? '',
          logoUrl:     h.logoUrl ?? null,
          themePreset: (h.settings?.themePreset as ThemePreset) ?? 'DARK_GOLD',
        });
      })
      .catch(() => {});
  }, [(user as any)?.hotelId, setBrand]);

  if (!checked) return null;
  return <>{children}</>;
}
