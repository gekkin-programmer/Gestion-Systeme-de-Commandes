import { create } from 'zustand';
import type { CartItem, ServiceItem } from '../types';

interface CartState {
  items: CartItem[];
  hotelId: string | null;
  stayToken: string | null;
  departmentType: string | null;

  initCart: (hotelId: string, stayToken: string) => void;
  addItem: (serviceItem: ServiceItem, departmentType: string) => void;
  removeItem: (serviceItemId: string) => void;
  updateQuantity: (serviceItemId: string, quantity: number) => void;
  clearCart: () => void;

  // Derived
  totalItems: () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  hotelId: null,
  stayToken: null,
  departmentType: null,

  initCart: (hotelId, stayToken) => set({ hotelId, stayToken, items: [] }),

  addItem: (serviceItem, departmentType) => {
    const { items } = get();
    const existing = items.find((i) => i.serviceItem.id === serviceItem.id);
    if (existing) {
      set({
        items: items.map((i) =>
          i.serviceItem.id === serviceItem.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        ),
      });
    } else {
      set({
        items: [...items, { serviceItem, quantity: 1 }],
        departmentType,
      });
    }
  },

  removeItem: (serviceItemId) => {
    set({ items: get().items.filter((i) => i.serviceItem.id !== serviceItemId) });
  },

  updateQuantity: (serviceItemId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(serviceItemId);
      return;
    }
    set({
      items: get().items.map((i) =>
        i.serviceItem.id === serviceItemId ? { ...i, quantity } : i
      ),
    });
  },

  clearCart: () => set({ items: [], departmentType: null }),

  totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
  subtotal: () =>
    get().items.reduce((sum, i) => sum + (i.serviceItem.price ?? 0) * i.quantity, 0),
}));
