'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useRestaurantStore } from '@/store/restaurantStore';
import api from '@/lib/api';
import type { ThemePreset } from '@repo/shared';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuthStore();
  const setBrand = useRestaurantStore((s) => s.setBrand);
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

  // Load restaurant brand so ThemeProvider applies correct theme everywhere
  useEffect(() => {
    if (!user?.restaurantId) return;
    api.get(`/restaurants/${user.restaurantId}`)
      .then(({ data }) => {
        const r = data.data;
        setBrand({
          name:        r.name ?? '',
          logoUrl:     r.logoUrl ?? null,
          themePreset: (r.settings?.themePreset as ThemePreset) ?? 'DARK_GOLD',
        });
      })
      .catch(() => {});
  }, [user?.restaurantId, setBrand]);

  if (!checked) return null;
  return <>{children}</>;
}
