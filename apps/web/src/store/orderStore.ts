import { create } from 'zustand';
import type { OrderDTO } from '@/types';

interface OrderState {
  activeOrders: OrderDTO[];
  currentOrderId: string | null;

  setCurrentOrderId: (id: string) => void;
  updateOrder: (order: OrderDTO) => void;
  addOrder: (order: OrderDTO) => void;
  clearOrders: () => void;
}

export const useOrderStore = create<OrderState>()((set) => ({
  activeOrders: [],
  currentOrderId: null,

  setCurrentOrderId: (id) => set({ currentOrderId: id }),

  updateOrder: (order) =>
    set((state) => ({
      activeOrders: state.activeOrders.map((o) => (o.id === order.id ? order : o)),
    })),

  addOrder: (order) =>
    set((state) => ({
      activeOrders: [order, ...state.activeOrders],
    })),

  clearOrders: () => set({ activeOrders: [], currentOrderId: null }),
}));
