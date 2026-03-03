'use client';

import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LordIcon } from '@/components/ui/LordIcon';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';
import type { MenuItemDTO } from '@/types';

interface MenuItemCardProps {
  item: MenuItemDTO;
  onViewDetails?: (item: MenuItemDTO) => void;
}

export function MenuItemCard({ item, onViewDetails }: MenuItemCardProps) {
  const t = useTranslations();
  const locale = useLocale();
  const addItem = useCartStore((s) => s.addItem);

  const name = locale === 'fr' ? item.nameFr : item.nameEn;
  const description = locale === 'fr' ? item.descriptionFr : item.descriptionEn;

  const handleAdd = () => {
    addItem({
      menuItemId: item.id,
      nameFr: item.nameFr,
      nameEn: item.nameEn,
      price: item.price,
      quantity: 1,
      imageUrl: item.imageUrl,
    });
  };

  return (
    <div className="flex gap-3 rounded-2xl bg-white p-3 shadow-sm">
      {item.imageUrl ? (
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
          <Image src={item.imageUrl} alt={name} fill className="object-cover" />
        </div>
      ) : (
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-orange-50">
          <LordIcon name="food" trigger="hover" size={36} colors="primary:#f97316,secondary:#1a1a1a" />
        </div>
      )}

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <div className="flex items-start gap-2">
            <p
              className="text-sm font-semibold text-gray-900 cursor-pointer hover:text-brand-600"
              onClick={() => onViewDetails?.(item)}
            >
              {name}
            </p>
            {item.isPopular && (
              <Badge variant="orange">{t('menu.popular')}</Badge>
            )}
          </div>
          {description && (
            <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">{description}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-brand-600">{formatPrice(item.price)}</span>
          {item.isAvailable ? (
            <Button size="sm" onClick={handleAdd}>
              + {t('menu.addToCart')}
            </Button>
          ) : (
            <span className="text-xs text-gray-400">{t('menu.unavailable')}</span>
          )}
        </div>
      </div>
    </div>
  );
}
