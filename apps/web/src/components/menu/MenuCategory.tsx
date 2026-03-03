'use client';

import { useLocale } from 'next-intl';
import { MenuItemCard } from './MenuItemCard';
import type { CategoryDTO, MenuItemDTO } from '@/types';

interface MenuCategoryProps {
  category: CategoryDTO & { items: MenuItemDTO[] };
  onViewItem?: (item: MenuItemDTO) => void;
}

export function MenuCategory({ category, onViewItem }: MenuCategoryProps) {
  const locale = useLocale();
  const name = locale === 'fr' ? category.nameFr : category.nameEn;

  if (category.items.length === 0) return null;

  return (
    <section>
      <h2 className="mb-3 text-base font-bold text-gray-800">{name}</h2>
      <div className="flex flex-col gap-3">
        {category.items.map((item) => (
          <MenuItemCard key={item.id} item={item} onViewDetails={onViewItem} />
        ))}
      </div>
    </section>
  );
}
