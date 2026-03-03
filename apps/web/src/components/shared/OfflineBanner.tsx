'use client';

import { useOnline } from '@/hooks/useOnline';
import { useTranslations } from 'next-intl';

export function OfflineBanner() {
  const isOnline = useOnline();
  const t = useTranslations();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-yellow-500 px-4 py-2 text-center text-sm font-medium text-white">
      {t('offline')}
    </div>
  );
}
