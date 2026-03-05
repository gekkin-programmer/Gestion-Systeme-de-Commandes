'use client';

import { useState, useCallback, useEffect } from 'react';
import api from '@/lib/api';
import type { OrderDTO } from '@/types';

// ── Status queue (persisted in localStorage) ─────────────────────────────────

const QUEUE_KEY = 'pending-status-updates';

interface StatusUpdate {
  orderId:   string;
  status:    string;
  updatedAt: string;
}

function loadQueue(): StatusUpdate[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function saveQueue(queue: StatusUpdate[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

function enqueueStatusUpdate(orderId: string, status: string) {
  // Keep only the latest status per order (dedup by orderId)
  const queue = loadQueue().filter((u) => u.orderId !== orderId);
  queue.push({ orderId, status, updatedAt: new Date().toISOString() });
  saveQueue(queue);
}

function dequeueOrderId(orderId: string) {
  saveQueue(loadQueue().filter((u) => u.orderId !== orderId));
}

// ── Main hook ─────────────────────────────────────────────────────────────────

export function useOrders(restaurantId: string) {
  const [orders,     setOrders]     = useState<OrderDTO[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

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
      // Optimistic local update
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: status as any } : o)));
      setPendingIds((prev) => new Set(prev).add(orderId));

      if (!navigator.onLine) {
        enqueueStatusUpdate(orderId, status);
        return;
      }

      try {
        const { data } = await api.patch(`/orders/${orderId}/status`, { status });
        setOrders((prev) => prev.map((o) => (o.id === orderId ? data.data : o)));
        setPendingIds((prev) => { const s = new Set(prev); s.delete(orderId); return s; });
        dequeueOrderId(orderId);
        return data.data as OrderDTO;
      } catch {
        // Network failure → queue for retry, keep optimistic UI
        enqueueStatusUpdate(orderId, status);
      }
    },
    [],
  );

  const addOrder = useCallback((order: OrderDTO) => {
    setOrders((prev) => [order, ...prev]);
  }, []);

  return { orders, loading, fetchOrders, updateOrderStatus, addOrder, setOrders, pendingIds };
}

// ── Sync hook (mount in staff/admin pages) ────────────────────────────────────

/**
 * When the browser comes back online, replays any queued status updates
 * in chronological order. Pass the `updateOrderStatus` from `useOrders`.
 */
export function useSyncStatusQueue(
  updateOrderStatus: (orderId: string, status: string) => Promise<any>,
) {
  useEffect(() => {
    const handleOnline = async () => {
      const queue = loadQueue();
      if (queue.length === 0) return;

      // Clear queue before processing so a mid-flight failure doesn't re-queue
      saveQueue([]);

      const sorted = [...queue].sort((a, b) => a.updatedAt.localeCompare(b.updatedAt));
      for (const { orderId, status } of sorted) {
        await updateOrderStatus(orderId, status);
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [updateOrderStatus]);
}
