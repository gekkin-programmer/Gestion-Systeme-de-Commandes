'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { BackButton } from '@/components/shared/BackButton';
import { formatPrice } from '@/lib/utils';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import dk from '@/styles/dark.module.css';
import type { OrderDTO } from '@/types';
import type { OrderStatus } from '@repo/shared';

const STATUS_LABEL: Partial<Record<OrderStatus, string>> = {
  PENDING:   'En attente',
  CONFIRMED: 'Confirmée',
  PREPARING: 'Préparation',
  READY:     'Prête',
  SERVED:    'Servie',
  CANCELLED: 'Annulée',
};

const STATUS_COLOR: Partial<Record<OrderStatus, string>> = {
  PENDING:   'var(--cream-dim)',
  CONFIRMED: 'var(--gold)',
  PREPARING: 'var(--gold)',
  READY:     '#4ade80',
  SERVED:    '#4ade80',
  CANCELLED: '#f87171',
};

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export default function OrderHistoryPage() {
  const locale       = useLocale();
  const { user }     = useAuth();
  const restaurantId = user?.restaurantId ?? '';

  const [date,        setDate]        = useState(todayISO());
  const [orders,      setOrders]      = useState<OrderDTO[]>([]);
  const [loading,     setLoading]     = useState(false);
  const [refundingId, setRefundingId] = useState<string | null>(null);
  const [refundError, setRefundError] = useState<string | null>(null);

  const handleRefund = useCallback(async (orderId: string) => {
    setRefundingId(orderId);
    setRefundError(null);
    try {
      await api.post(`/payments/${orderId}/refund`);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, payment: o.payment ? { ...o.payment, status: 'REFUNDED' } : o.payment }
            : o,
        ),
      );
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Erreur lors du remboursement.';
      setRefundError(msg);
    } finally {
      setRefundingId(null);
    }
  }, []);

  useEffect(() => {
    if (!restaurantId) return;
    setLoading(true);
    api.get(`/orders/restaurant/${restaurantId}?date=${date}`)
      .then(({ data }) => setOrders(data.data))
      .finally(() => setLoading(false));
  }, [restaurantId, date]);

  const summary = useMemo(() => {
    const total   = orders.filter((o) => o.status !== 'CANCELLED').length;
    const revenue = orders
      .filter((o) => o.status === 'SERVED')
      .reduce((s, o) => s + o.totalAmount, 0);
    const paid    = orders.filter((o) => o.payment?.status === 'PAID').length;
    return { total, revenue, paid };
  }, [orders]);

  return (
    <div className={dk.page}>

      <header className={dk.header}>
        <BackButton />
        <span className={dk.headerTitle}>Historique</span>
        <div className={dk.headerRight}>
          <input
            type="date"
            value={date}
            max={todayISO()}
            onChange={(e) => setDate(e.target.value)}
            style={{
              background:  'none',
              border:      '1px solid var(--line)',
              color:       'var(--cream-dim)',
              fontFamily:  'Jost, sans-serif',
              fontSize:    11,
              padding:     '4px 8px',
              cursor:      'pointer',
            }}
          />
        </div>
      </header>

      <main className={dk.main}>

        {/* Summary strip */}
        <div className={dk.summaryStrip}>
          <div className={dk.summaryCell}>
            <span className={dk.summaryCellLabel}>Commandes</span>
            <span className={dk.summaryCellValue}>{summary.total}</span>
          </div>
          <div className={dk.summaryCell}>
            <span className={dk.summaryCellLabel}>Revenus</span>
            <span className={dk.summaryCellValue}>{formatPrice(summary.revenue)}</span>
          </div>
          <div className={dk.summaryCell}>
            <span className={dk.summaryCellLabel}>Payées</span>
            <span className={dk.summaryCellValue}>{summary.paid}</span>
          </div>
        </div>

        {/* Refund error toast */}
        {refundError && (
          <div className={dk.errorBox} style={{ marginBottom: 12 }}>
            <span className={dk.errorText}>{refundError}</span>
            <button
              onClick={() => setRefundError(null)}
              style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', marginLeft: 'auto', fontSize: 14 }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Orders list */}
        {loading ? (
          <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 12, color: 'var(--cream-dim)', textAlign: 'center', padding: '40px 0' }}>
            Chargement…
          </p>
        ) : orders.length === 0 ? (
          <div className={dk.card} style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 13, color: 'var(--cream-dim)' }}>
              Aucune commande ce jour.
            </p>
          </div>
        ) : (
          <div className={dk.card} style={{ padding: 0, overflow: 'hidden' }}>
            {orders.map((order) => {
              const color     = STATUS_COLOR[order.status as OrderStatus] ?? 'var(--cream-dim)';
              const isPaid    = order.payment?.status === 'PAID';
              const isRefunded = order.payment?.status === 'REFUNDED';
              const isRefunding = refundingId === order.id;

              return (
                <div key={order.id} style={{ borderBottom: '1px solid var(--line)' }}>
                  <Link
                    href={`/${locale}/order/${order.id}`}
                    style={{ textDecoration: 'none', display: 'block' }}
                  >
                    <div className={dk.historyRow} style={{ borderBottom: 'none' }}>
                      {/* Status dot */}
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />

                      {/* Time + number */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 54 }}>
                        <span style={{ fontFamily: 'Jost, sans-serif', fontSize: 12, color: 'var(--cream)' }}>
                          {formatTime(order.createdAt)}
                        </span>
                        <span style={{ fontFamily: 'Jost, sans-serif', fontSize: 9, letterSpacing: '0.1em', color: 'var(--cream-dim)' }}>
                          {order.orderNumber}
                        </span>
                      </div>

                      {/* Status label */}
                      <span style={{ flex: 1, fontFamily: 'Jost, sans-serif', fontSize: 11, color }}>
                        {STATUS_LABEL[order.status as OrderStatus] ?? order.status}
                      </span>

                      {/* Payment badge */}
                      {isRefunded && (
                        <span style={{
                          fontFamily: 'Jost, sans-serif', fontSize: 8, letterSpacing: '0.1em',
                          textTransform: 'uppercase', color: '#94a3b8',
                          border: '1px solid rgba(148,163,184,0.35)', padding: '2px 6px', flexShrink: 0,
                        }}>
                          Remboursé
                        </span>
                      )}

                      {/* Amount */}
                      <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 14, color: 'var(--gold)', flexShrink: 0 }}>
                        {formatPrice(order.totalAmount)}
                      </span>
                    </div>
                  </Link>

                  {/* Refund button — shown only for PAID orders */}
                  {isPaid && !isRefunded && (
                    <div style={{ padding: '0 16px 12px', display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        className={dk.btnDanger}
                        style={{ fontSize: 9, padding: '5px 14px' }}
                        disabled={isRefunding}
                        onClick={() => handleRefund(order.id)}
                      >
                        {isRefunding ? 'Remboursement…' : 'Rembourser'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
