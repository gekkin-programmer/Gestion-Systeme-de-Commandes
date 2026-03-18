'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { OrderKanbanBoard } from '@/components/staff/OrderKanbanBoard';
import { useAuth } from '@/hooks/useAuth';
import { useOrders, useSyncStatusQueue } from '@/hooks/useOrders';
import { useRestaurantSocket } from '@/hooks/useSocket';
import { useNotification } from '@/hooks/useNotification';
import dk from '@/styles/dark.module.css';
import type { OrderDTO } from '@/types';

export default function StaffOrdersPage() {
  const t = useTranslations();
  const { user, accessToken, logout } = useAuth();
  const restaurantId = user?.restaurantId ?? '';

  const { orders, loading, fetchOrders, updateOrderStatus, addOrder, setOrders, pendingIds } = useOrders(restaurantId);
  useSyncStatusQueue(updateOrderStatus);
  const { playNewOrderSound, showBrowserNotification } = useNotification();

  useRestaurantSocket(accessToken, {
    onOrderNew: (order: unknown) => {
      const o = order as OrderDTO;
      addOrder(o);
      playNewOrderSound();
      showBrowserNotification(t('staff.newOrder'), `Commande ${o.orderNumber}`);
    },
    onOrderStatusChanged: (updated: unknown) => {
      const o = updated as OrderDTO;
      setOrders((prev) => prev.map((x) => x.id === o.id ? o : x));
    },
  });

  useEffect(() => {
    if (restaurantId) fetchOrders();
  }, [restaurantId]);

  if (!user?.restaurantId) {
    return (
      <div
        className={dk.page}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <p className={dk.errorText}>Accès non autorisé</p>
      </div>
    );
  }

  const activeOrders = orders.filter((o) => !['SERVED', 'CANCELLED'].includes(o.status));

  return (
    <div className={dk.page} style={{ minHeight: '100vh' }}>

      {/* Header */}
      <header className={dk.header} style={{ height: 64 }}>
        <div style={{ flex: 1 }}>
          <span
            className={dk.playfair}
            style={{ fontSize: 17, color: 'var(--cream)', display: 'block', lineHeight: 1.2 }}
          >
            {t('staff.title')}
          </span>
          <span
            style={{
              fontFamily: 'Jost, sans-serif',
              fontSize: 10,
              color: 'var(--cream-dim)',
              letterSpacing: '0.05em',
            }}
          >
            {user.email}
          </span>
        </div>

        <div className={dk.headerRight}>
          {/* Active count chip */}
          <span
            style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: 13,
              color: 'var(--gold)',
              border: '1px solid var(--line)',
              padding: '3px 10px',
            }}
          >
            {activeOrders.length} active{activeOrders.length !== 1 ? 's' : ''}
          </span>

          {/* Logout */}
          <button
            className={dk.backBtn}
            onClick={logout}
            style={{ marginLeft: 4 }}
          >
            Déconnexion
          </button>
        </div>
      </header>

      {/* Kanban */}
      <main style={{ padding: '24px 20px 40px', maxWidth: 1100, margin: '0 auto' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
            <span className={dk.playfair} style={{ fontSize: 18, color: 'var(--cream-dim)' }}>
              Chargement des commandes…
            </span>
          </div>
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
