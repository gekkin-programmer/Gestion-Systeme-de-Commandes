'use client';

import { useLocale } from 'next-intl';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';
import dk from '@/styles/dark.module.css';
import type { CartItem as CartItemType } from '@/types';

export function CartItem({ item }: { item: CartItemType }) {
  const locale = useLocale();
  const { updateQuantity, removeItem } = useCartStore();
  const name = locale === 'fr' ? item.nameFr : item.nameEn;

  return (
    <div className={dk.cartRow}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p className={dk.cartName}>{name}</p>
        <p className={dk.cartUnitPrice}>{formatPrice(item.price)} / unité</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          className={dk.qtyBtn}
          onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
          aria-label="Diminuer"
        >
          −
        </button>
        <span className={dk.qtyCount}>{item.quantity}</span>
        <button
          className={dk.qtyBtn}
          onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
          aria-label="Augmenter"
        >
          +
        </button>
      </div>

      <p className={dk.cartLinePrice}>{formatPrice(item.price * item.quantity)}</p>

      <button
        onClick={() => removeItem(item.menuItemId)}
        aria-label="Supprimer"
        style={{
          background: 'none',
          border: '1px solid var(--line)',
          color: 'var(--cream)',
          width: 28,
          height: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontSize: 14,
          flexShrink: 0,
          transition: 'border-color 0.2s, color 0.2s',
        }}
      >
        ×
      </button>
    </div>
  );
}
