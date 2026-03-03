'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { OrderStatusStepper } from '@/components/order/OrderStatusStepper';
import { formatPrice } from '@/lib/utils';
import api from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import { useSessionSocket } from '@/hooks/useSocket';
import dk from '@/styles/dark.module.css';
import type { OrderDTO } from '@/types';
import type { OrderStatus } from '@repo/shared';

const STATUS_FR: Partial<Record<OrderStatus, string>> = {
  PENDING:   'En attente de confirmation',
  CONFIRMED: 'Commande confirmée',
  PREPARING: 'Préparation en cours',
  READY:     'Prête à servir',
  SERVED:    'Servie — Bon appétit !',
  CANCELLED: 'Commande annulée',
};

interface OrderPageProps {
  params: { orderId: string; locale: string };
}

export default function OrderPage({ params }: OrderPageProps) {
  const locale       = useLocale();
  const router       = useRouter();
  const sessionToken = useCartStore((s) => s.sessionToken);

  const [order,   setOrder]   = useState<OrderDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${params.orderId}/status`)
      .then(({ data }) => setOrder(data.data))
      .finally(() => setLoading(false));
  }, [params.orderId]);

  useSessionSocket(sessionToken, {
    onOrderStatusChanged: (updated: unknown) => {
      const o = updated as OrderDTO;
      if (o.id === params.orderId) setOrder(o);
    },
  });

  /* Polling fallback every 30s */
  useEffect(() => {
    const interval = setInterval(async () => {
      const { data } = await api.get(`/orders/${params.orderId}/status`);
      setOrder(data.data);
    }, 30_000);
    return () => clearInterval(interval);
  }, [params.orderId]);

  /* ── Loading ── */
  if (loading) {
    return (
      <div
        className={dk.page}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <span className={dk.playfair} style={{ fontSize: 18, color: 'var(--cream-dim)' }}>
          Chargement…
        </span>
      </div>
    );
  }
  if (!order) return null;

  const isPaid      = order.payment?.status === 'PAID';
  const isCancelled = order.status === 'CANCELLED';
  const isServed    = order.status === 'SERVED';

  return (
    <div className={dk.page}>

      {/* Header */}
      <header className={dk.header}>
        <button className={dk.backBtn} onClick={() => router.back()}>
          ← Retour
        </button>
        <span className={dk.headerTitle}>Ma commande</span>
        <div className={dk.headerRight}>
          <span className={dk.orderNum}>{order.orderNumber}</span>
        </div>
      </header>

      <main className={dk.main}>

        {/* Status headline */}
        <div className={dk.card} style={{ textAlign: 'center', padding: '28px 20px' }}>
          <p
            className={dk.sectionLabel}
            style={{ marginBottom: 10 }}
          >
            Statut
          </p>
          <p
            className={dk.playfair}
            style={{
              fontSize: 22,
              color: isCancelled ? '#f87171' : isServed ? '#6fcf6f' : 'var(--cream)',
              marginBottom: 6,
            }}
          >
            {STATUS_FR[order.status as OrderStatus] ?? order.status}
          </p>
          <span className={dk.orderNum}>{order.orderNumber}</span>
        </div>

        {/* Stepper */}
        {!isCancelled && (
          <div className={dk.card}>
            <span className={dk.sectionLabel}>Progression</span>
            <OrderStatusStepper status={order.status as OrderStatus} />
          </div>
        )}

        {/* Cancelled block */}
        {isCancelled && (
          <div className={dk.errorBox} style={{ marginBottom: 10 }}>
            <span className={dk.errorText}>
              Cette commande a été annulée. Contactez le personnel si nécessaire.
            </span>
          </div>
        )}

        {/* Order items */}
        <div className={dk.card}>
          <span className={dk.sectionLabel}>Articles commandés</span>
          {order.items.map((item) => (
            <div key={item.id} className={dk.row}>
              <span className={dk.rowLabel}>
                {locale === 'fr' ? item.itemNameFr : item.itemNameEn}
                <span style={{ marginLeft: 6, color: 'var(--cream-dim)' }}>× {item.quantity}</span>
              </span>
              <span className={dk.rowValue}>{formatPrice(item.subtotal)}</span>
            </div>
          ))}
          <div className={dk.row} style={{ borderBottom: 'none' }}>
            <span className={dk.rowLabel} style={{ color: 'var(--cream)', fontWeight: 600 }}>Total</span>
            <span className={dk.rowTotal}>{formatPrice(order.totalAmount)}</span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
          {!isCancelled && !isPaid && (
            <Link href={`/${locale}/payment/${order.id}`} style={{ display: 'block' }}>
              <button className={dk.btn} style={{ width: '100%' }}>
                Procéder au paiement — {formatPrice(order.totalAmount)}
              </button>
            </Link>
          )}
          {isPaid && (
            <Link href={`/${locale}/order/${order.id}/receipt`} style={{ display: 'block' }}>
              <button className={dk.btnOutline} style={{ width: '100%' }}>
                Télécharger le reçu
              </button>
            </Link>
          )}
          {isServed && (
            <div className={dk.successBox}>
              <span className={dk.playfair} style={{ fontSize: 20, color: 'var(--gold)' }}>
                Bon appétit !
              </span>
              <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 12, color: 'var(--cream-dim)' }}>
                Merci d'avoir commandé chez nous.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
