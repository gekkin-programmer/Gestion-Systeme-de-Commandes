'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import api from '@/lib/api';
import dk from '@/styles/dark.module.css';
import type { OrderDTO } from '@/types';
import type { OrderStatus } from '@repo/shared';

const STATUS_COLOR: Record<string, string> = {
  SERVED:    '#6fcf6f',
  PENDING:   'var(--cream-dim)',
  CONFIRMED: 'var(--gold)',
  PREPARING: '#d4a04a',
  READY:     'var(--gold)',
  CANCELLED: '#f87171',
};

const STATUS_FR: Partial<Record<OrderStatus, string>> = {
  PENDING:   'En attente',
  CONFIRMED: 'Confirmée',
  PREPARING: 'En préparation',
  READY:     'Prête',
  SERVED:    'Servie',
  CANCELLED: 'Annulée',
};

export default function OrderHistoryPage() {
  const locale  = useLocale();
  const router  = useRouter();

  const [phone,    setPhone]    = useState('');
  const [orders,   setOrders]   = useState<OrderDTO[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [searched, setSearched] = useState(false);

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.get(`/orders/history?phone=${encodeURIComponent(phone)}`);
      setOrders(data.data);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={dk.page}>

      {/* Header */}
      <header className={dk.header}>
        <button className={dk.backBtn} onClick={() => router.back()}>
          ← Retour
        </button>
        <span className={dk.headerTitle}>Historique</span>
        <div className={dk.headerRight} />
      </header>

      <main className={dk.main}>
        <span className={dk.sectionLabel}>Retrouvez vos commandes</span>

        {/* Search form */}
        <div className={dk.card}>
          <form onSubmit={search} style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <div className={dk.inputGroup} style={{ marginBottom: 0 }}>
                <label className={dk.inputLabel} htmlFor="phone">Numéro de téléphone</label>
                <input
                  id="phone"
                  type="tel"
                  className={dk.input}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+237 6XX XXX XXX"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className={dk.btn}
              disabled={loading}
              style={{ alignSelf: 'flex-end', whiteSpace: 'nowrap' }}
            >
              {loading ? '…' : 'Rechercher'}
            </button>
          </form>
        </div>

        {/* Loading */}
        {loading && (
          <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 12, color: 'var(--cream-dim)', textAlign: 'center', padding: '20px 0' }}>
            Recherche en cours…
          </p>
        )}

        {/* No results */}
        {searched && !loading && orders.length === 0 && (
          <div className={dk.card} style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 13, color: 'var(--cream-dim)' }}>
              Aucune commande trouvée pour ce numéro.
            </p>
          </div>
        )}

        {/* Results */}
        {orders.map((order) => (
          <div key={order.id} className={dk.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 12, fontWeight: 600, color: 'var(--cream)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {order.orderNumber}
                </p>
                <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 11, color: 'var(--cream-dim)', marginTop: 2 }}>
                  {new Date(order.createdAt).toLocaleDateString(
                    locale === 'fr' ? 'fr-FR' : 'en-US',
                    { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' },
                  )}
                </p>
              </div>
              <span
                style={{
                  fontFamily: 'Jost, sans-serif',
                  fontSize: 10,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: STATUS_COLOR[order.status] ?? 'var(--cream-dim)',
                }}
              >
                {STATUS_FR[order.status as OrderStatus] ?? order.status}
              </span>
            </div>

            <div className={dk.divider} style={{ margin: '8px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'Jost, sans-serif', fontSize: 11, color: 'var(--cream-dim)' }}>
                {order.items.length} article{order.items.length > 1 ? 's' : ''}
              </span>
              <span className={dk.goldPrice} style={{ fontSize: 16 }}>
                {formatPrice(order.totalAmount)}
              </span>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
