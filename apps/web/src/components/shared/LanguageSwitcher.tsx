'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    // Replace locale prefix in pathname
    const segments = pathname.split('/');
    segments[1] = newLocale;
    router.push(segments.join('/'));
  };

  return (
    <div className="flex gap-1 rounded-lg border border-gray-200 p-0.5">
      {(['fr', 'en'] as const).map((l) => (
        <button
          key={l}
          onClick={() => switchLocale(l)}
          className={`rounded-md px-2 py-1 text-xs font-semibold uppercase transition-colors ${
            locale === l
              ? 'bg-brand-500 text-white'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
