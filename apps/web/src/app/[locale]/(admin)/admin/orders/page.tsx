'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

// Redirect old /admin/orders → /admin/requests
export default function OldOrdersRedirect() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  useEffect(() => {
    router.replace(`/${locale}/admin/requests`);
  }, [locale, router]);

  return null;
}
