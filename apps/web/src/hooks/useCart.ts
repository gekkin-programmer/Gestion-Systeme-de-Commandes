'use client';

import { useCartStore } from '@/store/cartStore';
import type { CartItem } from '@/types';

export function useCart() {
  const { items, addItem, removeItem, updateQuantity, clearCart, notes, customerPhone, setNotes, setCustomerPhone, getTotalItems, getSubtotal } =
    useCartStore();

  return {
    items,
    notes,
    customerPhone,
    totalItems: getTotalItems(),
    subtotal: getSubtotal(),
    addItem: (item: CartItem) => addItem(item),
    removeItem,
    updateQuantity,
    clearCart,
    setNotes,
    setCustomerPhone,
  };
}
