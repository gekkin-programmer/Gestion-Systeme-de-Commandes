'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { OrderKanbanBoard } from '@/components/staff/OrderKanbanBoard';
import { BackButton } from '@/components/shared/BackButton';
import { useAuth } from '@/hooks/useAuth';
import { useOrders, useSyncStatusQueue } from '@/hooks/useOrders';
import dk from '@/styles/dark.module.css';

export default function AdminOrdersPage() {
  const locale       = useLocale();
  const { user }     = useAuth();
  const restaurantId = user?.restaurantId ?? '';
  const { orders, loading, fetchOrders, updateOrderStatus, pendingIds } = useOrders(restaurantId);
  useSyncStatusQueue(updateOrderStatus);

  useEffect(() => {
    if (restaurantId) fetchOrders();
  }, [restaurantId]);

  const activeOrders = orders.filter((o) => !['SERVED', 'CANCELLED'].includes(o.status));

  return (
    <div className={dk.page} style={{ minHeight: '100vh' }}>

      {/* Header */}
      <header className={dk.header}>
        <BackButton />
        <span className={dk.headerTitle}>Commandes en cours</span>
        <div className={dk.headerRight} style={{ gap: 10 }}>
          <Link href={`/${locale}/admin/orders/history`}>
            <button className={dk.btnOutline} style={{ fontSize: 9, padding: '6px 14px' }}>
              Historique
            </button>
          </Link>
          <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 14, color: 'var(--gold)', border: '1px solid var(--line)', padding: '3px 10px' }}>
            {activeOrders.length}
          </span>
        </div>
      </header>

      <main style={{ padding: '24px 20px 40px', maxWidth: 1100, margin: '0 auto' }}>
        {loading ? (
          <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 12, color: 'var(--cream-dim)', textAlign: 'center', padding: '40px 0' }}>
            Chargement…
          </p>
        ) : (
          <OrderKanbanBoard
            orders={activeOrders}
            onStatusChange={async (id, status) => { await updateOrderStatus(id, status); }}
            pendingIds={pendingIds}
          />
        )}
      </main>
    </div>
  );
}
