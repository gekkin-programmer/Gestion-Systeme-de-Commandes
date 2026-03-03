'use client';

import { useState, useCallback } from 'react';
import api from '@/lib/api';
import type { OrderDTO } from '@/types';

export function useOrders(restaurantId: string) {
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = useCallback(
    async (params?: { status?: string }) => {
      setLoading(true);
      try {
        const { data } = await api.get(`/orders/restaurant/${restaurantId}`, { params });
        setOrders(data.data);
      } finally {
        setLoading(false);
      }
    },
    [restaurantId],
  );

  const updateOrderStatus = useCallback(
    async (orderId: string, status: string) => {
      const { data } = await api.patch(`/orders/${orderId}/status`, { status });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? data.data : o)));
      return data.data as OrderDTO;
    },
    [],
  );

  const addOrder = useCallback((order: OrderDTO) => {
    setOrders((prev) => [order, ...prev]);
  }, []);

  return { orders, loading, fetchOrders, updateOrderStatus, addOrder, setOrders };
}
