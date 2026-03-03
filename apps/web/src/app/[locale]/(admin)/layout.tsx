'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuthStore();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const allowed = isAuthenticated && (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN');
    if (!allowed) {
      // Preserve intended destination so login can redirect back
      const locale = pathname.split('/')[1] ?? 'fr';
      router.replace(`/${locale}/login`);
    } else {
      setChecked(true);
    }
  }, [isAuthenticated, user, router, pathname]);

  if (!checked) return null;
  return <>{children}</>;
}
