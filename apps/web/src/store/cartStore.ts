import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '@/types';

export interface PendingOrder {
  items: CartItem[];
  sessionToken: string;
  notes: string;
  customerPhone: string;
  paymentMethod: string;
  isMobileMoney: boolean;
  queuedAt: string;
}

interface CartState {
  items: CartItem[];
  sessionToken: string | null;
  restaurantSlug: string | null;
  notes: string;
  customerPhone: string;
  pendingOrder: PendingOrder | null;
  isSyncing: boolean;
  lang: 'fr' | 'en';

  addItem: (item: CartItem) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  setSession: (token: string, slug: string) => void;
  setLang: (lang: 'fr' | 'en') => void;
  setNotes: (notes: string) => void;
  setCustomerPhone: (phone: string) => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
  setPendingOrder: (order: PendingOrder) => void;
  clearPendingOrder: () => void;
  setIsSyncing: (v: boolean) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      sessionToken: null,
      restaurantSlug: null,
      notes: '',
      customerPhone: '',
      pendingOrder: null,
      isSyncing: false,
      lang: 'fr',

      addItem: (newItem) => {
        set((state) => {
          const existing = state.items.find((i) => i.menuItemId === newItem.menuItemId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.menuItemId === newItem.menuItemId
                  ? { ...i, quantity: i.quantity + newItem.quantity }
                  : i,
              ),
            };
          }
          return { items: [...state.items, newItem] };
        });
      },

      removeItem: (menuItemId) =>
        set((state) => ({ items: state.items.filter((i) => i.menuItemId !== menuItemId) })),

      updateQuantity: (menuItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(menuItemId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) => (i.menuItemId === menuItemId ? { ...i, quantity } : i)),
        }));
      },

      clearCart: () => set({ items: [], notes: '', customerPhone: '' }),

      setSession: (token, slug) => {
        const current = get().sessionToken;
        // New session (different token) → clear stale cart items
        if (current && current !== token) {
          set({ items: [], notes: '', customerPhone: '', pendingOrder: null, sessionToken: token, restaurantSlug: slug });
        } else {
          set({ sessionToken: token, restaurantSlug: slug });
        }
      },

      setLang: (lang) => set({ lang }),

      setNotes: (notes) => set({ notes }),

      setCustomerPhone: (customerPhone) => set({ customerPhone }),

      getTotalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      getSubtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      setPendingOrder: (order) => set({ pendingOrder: order }),
      clearPendingOrder: () => set({ pendingOrder: null }),
      setIsSyncing: (v) => set({ isSyncing: v }),
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        items: state.items,
        sessionToken: state.sessionToken,
        restaurantSlug: state.restaurantSlug,
        notes: state.notes,
        customerPhone: state.customerPhone,
        pendingOrder: state.pendingOrder,
        lang: state.lang,
      }),
    },
  ),
);
