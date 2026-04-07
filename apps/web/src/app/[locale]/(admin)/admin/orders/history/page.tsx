'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

// Redirect old /admin/orders/history → /admin/requests/history
export default function OldHistoryRedirect() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  useEffect(() => {
    router.replace(`/${locale}/admin/requests/history`);
  }, [locale, router]);

  return null;
}
