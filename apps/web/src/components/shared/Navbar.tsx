'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useCartStore } from '@/store/cartStore';
import { LordIcon } from '@/components/ui/LordIcon';
import { LanguageSwitcher } from './LanguageSwitcher';

interface NavbarProps {
  restaurantName?: string;
  tableLabel?: string;
  showCart?: boolean;
}

export function Navbar({ restaurantName, tableLabel, showCart = false }: NavbarProps) {
  const t = useTranslations();
  const locale = useLocale();
  const totalItems = useCartStore((s) => s.getTotalItems());

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <LordIcon name="restaurant" trigger="in" size={28} colors="primary:#f97316,secondary:#1a1a1a" />
          <div>
            <p className="text-sm font-bold text-gray-900">{restaurantName ?? t('app.name')}</p>
            {tableLabel && <p className="text-xs text-gray-500">{tableLabel}</p>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          {showCart && (
            <Link
              href={`/${locale}/cart`}
              className="relative flex h-9 w-9 items-center justify-center rounded-full bg-brand-50"
            >
              <LordIcon name="cart" trigger="hover" size={22} colors="primary:#f97316,secondary:#1a1a1a" />
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
