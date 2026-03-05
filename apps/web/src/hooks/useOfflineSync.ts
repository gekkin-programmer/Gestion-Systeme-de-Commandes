'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useCartStore } from '@/store/cartStore';
import api from '@/lib/api';

/**
 * Listens for the browser `online` event and retries any queued order
 * that was saved while the device was offline. Mount this hook in a
 * persistent client component (e.g. OfflineBanner) so it runs everywhere.
 */
export function useOfflineSync() {
  const { pendingOrder, clearPendingOrder, setIsSyncing } = useCartStore();
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    const handleOnline = async () => {
      if (!pendingOrder) return;

      setIsSyncing(true);
      try {
        // 1 — Place the order
        const { data } = await api.post('/orders', {
          sessionToken:  pendingOrder.sessionToken,
          items:         pendingOrder.items.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity })),
          notes:         pendingOrder.notes.trim() || undefined,
          customerPhone: pendingOrder.customerPhone.trim() || undefined,
        });
        const orderId: string = data.data.id;

        // 2 — Initiate payment
        await api.post('/payments/initiate', {
          orderId,
          method:           pendingOrder.paymentMethod,
          mobileMoneyPhone: pendingOrder.isMobileMoney ? pendingOrder.customerPhone.trim() : undefined,
        });

        // 3 — Auto-confirm mobile money (mock)
        if (pendingOrder.isMobileMoney) {
          await api.post(`/payments/callback/mock/${orderId}?simulate=success`);
        }

        clearPendingOrder();
        router.push(`/${locale}/order/${orderId}`);
      } catch (err: any) {
        // Session expired or table not found → clear the invalid queue entry
        const status = err?.response?.status;
        if (status === 401 || status === 404 || status === 400) {
          clearPendingOrder();
        }
        // For any other error keep the queue so next reconnect retries
      } finally {
        setIsSyncing(false);
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [pendingOrder]); // re-bind whenever the pending order changes
}
