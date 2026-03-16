'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useLocale } from 'next-intl';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useRestaurantSocket } from '@/hooks/useSocket';
import dk from '@/styles/dark.module.css';
import type { OrderDTO, OrderItemDTO } from '@/types';
import type { OrderStatus } from '@repo/shared';

/* ─── Helpers ─────────────────────────────────────────────── */

function elapsedLabel(iso: string): string {
  const diffMs  = Date.now() - new Date(iso).getTime();
  const mins    = Math.floor(diffMs / 60_000);
  if (mins < 1)  return 'à l\'instant';
  if (mins === 1) return 'il y a 1 min';
  if (mins < 60) return `il y a ${mins} min`;
  const hrs = Math.floor(mins / 60);
  return `il y a ${hrs} h`;
}

const STATUS_NEXT: Partial<Record<OrderStatus, OrderStatus>> = {
  CONFIRMED: 'PREPARING',
  PREPARING: 'READY',
};

const STATUS_BTN_LABEL: Partial<Record<OrderStatus, string>> = {
  CONFIRMED: 'Commencer la préparation',
  PREPARING: 'Prêt à servir',
};

const STATUS_BTN_ARROW: Partial<Record<OrderStatus, string>> = {
  CONFIRMED: '→',
  PREPARING: '✓',
};

const STATUS_COL_COLOR: Partial<Record<OrderStatus, string>> = {
  CONFIRMED: '#d97706', // amber
  PREPARING: '#ea580c', // orange
};

const STATUS_LABEL_FR: Partial<Record<OrderStatus, string>> = {
  CONFIRMED: 'Confirmée',
  PREPARING: 'En préparation',
};

/* ─── Component ──────────────────────────────────────────── */

export default function KitchenDisplayPage() {
  const locale          = useLocale();
  const { user, accessToken, logout } = useAuth();
  const restaurantId    = user?.restaurantId ?? '';

  const [orders,      setOrders]      = useState<OrderDTO[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [pendingIds,  setPendingIds]  = useState<Set<string>>(new Set());
  const [tick,        setTick]        = useState(0);
  const intervalRef   = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ── Fetch ─────────────────────────────────────────────── */

  const fetchKitchenOrders = useCallback(async () => {
    if (!restaurantId) return;
    try {
      const [confirmedRes, preparingRes] = await Promise.all([
        api.get(`/orders/restaurant/${restaurantId}?status=CONFIRMED`),
        api.get(`/orders/restaurant/${restaurantId}?status=PREPARING`),
      ]);
      const combined: OrderDTO[] = [
        ...(confirmedRes.data.data ?? []),
        ...(preparingRes.data.data ?? []),
      ];
      // deduplicate by id
      const map = new Map<string, OrderDTO>();
      combined.forEach((o) => map.set(o.id, o));
      setOrders(Array.from(map.values()).sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      ));
    } catch {
      /* silent — next poll will retry */
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    fetchKitchenOrders();
    intervalRef.current = setInterval(fetchKitchenOrders, 30_000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchKitchenOrders]);

  /* ── Live timer tick every 30s ─────────────────────────── */
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 30_000);
    return () => clearInterval(t);
  }, []);

  /* ── Socket ────────────────────────────────────────────── */

  const handleOrderNew = useCallback((incoming: unknown) => {
    const o = incoming as OrderDTO;
    if (!['CONFIRMED', 'PREPARING'].includes(o.status)) return;
    setOrders((prev) => {
      if (prev.some((p) => p.id === o.id)) return prev;
      return [...prev, o].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    });
  }, []);

  const handleOrderStatusChanged = useCallback((incoming: unknown) => {
    const o = incoming as OrderDTO;
    setOrders((prev) => {
      // Remove if no longer relevant to kitchen
      if (!['CONFIRMED', 'PREPARING'].includes(o.status)) {
        return prev.filter((p) => p.id !== o.id);
      }
      const exists = prev.some((p) => p.id === o.id);
      if (exists) {
        return prev.map((p) => p.id === o.id ? o : p);
      }
      return [...prev, o].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    });
  }, []);

  useRestaurantSocket(accessToken, {
    onOrderNew:           handleOrderNew,
    onOrderStatusChanged: handleOrderStatusChanged,
  });

  /* ── Status update ─────────────────────────────────────── */

  const handleAdvanceStatus = async (order: OrderDTO) => {
    const next = STATUS_NEXT[order.status as OrderStatus];
    if (!next) return;
    setPendingIds((prev) => new Set(prev).add(order.id));
    try {
      await api.patch(`/orders/${order.id}/status`, { status: next });
      setOrders((prev) => prev.filter((o) => o.id !== order.id));
    } catch {
      /* silent */
    } finally {
      setPendingIds((prev) => {
        const s = new Set(prev);
        s.delete(order.id);
        return s;
      });
    }
  };

  /* ── Guard ─────────────────────────────────────────────── */

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

  const confirmed = orders.filter((o) => o.status === 'CONFIRMED');
  const preparing = orders.filter((o) => o.status === 'PREPARING');

  /* ── Render ─────────────────────────────────────────────── */

  return (
    <div className={dk.page} style={{ minHeight: '100vh' }}>

      {/* Header */}
      <header className={dk.header} style={{ height: 64 }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 16 }}>
          <span
            className={dk.playfair}
            style={{ fontSize: 20, color: 'var(--cream)', lineHeight: 1 }}
          >
            Cuisine
          </span>
          <span
            style={{
              fontFamily:    'Jost, sans-serif',
              fontSize:      9,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color:         'var(--cream-dim)',
            }}
          >
            Affichage cuisine (KDS)
          </span>
        </div>
        <div className={dk.headerRight}>
          {/* Order counts */}
          <span
            style={{
              fontFamily:    'Jost, sans-serif',
              fontSize:      10,
              color:         STATUS_COL_COLOR.CONFIRMED,
              border:        `1px solid ${STATUS_COL_COLOR.CONFIRMED}44`,
              padding:       '3px 10px',
              letterSpacing: '0.06em',
            }}
          >
            {confirmed.length} confirmée{confirmed.length !== 1 ? 's' : ''}
          </span>
          <span
            style={{
              fontFamily:    'Jost, sans-serif',
              fontSize:      10,
              color:         STATUS_COL_COLOR.PREPARING,
              border:        `1px solid ${STATUS_COL_COLOR.PREPARING}44`,
              padding:       '3px 10px',
              letterSpacing: '0.06em',
            }}
          >
            {preparing.length} en préparation
          </span>
          <button className={dk.backBtn} onClick={logout}>
            Déconnexion
          </button>
        </div>
      </header>

      {/* Body */}
      <main style={{ padding: '24px 20px 40px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
            <span
              className={dk.playfair}
              style={{ fontSize: 20, color: 'var(--cream-dim)' }}
            >
              Chargement des commandes…
            </span>
          </div>
        ) : orders.length === 0 ? (
          <div
            style={{
              display:        'flex',
              flexDirection:  'column',
              alignItems:     'center',
              justifyContent: 'center',
              paddingTop:     120,
              gap:            16,
            }}
          >
            <span style={{ fontSize: 48 }}>✓</span>
            <span
              className={dk.playfair}
              style={{ fontSize: 24, color: 'var(--cream-dim)' }}
            >
              Pas de commandes en attente
            </span>
            <span
              style={{
                fontFamily: 'Jost, sans-serif',
                fontSize:   11,
                color:      'var(--cream-dim)',
                opacity:    0.5,
              }}
            >
              Mise à jour automatique toutes les 30 secondes
            </span>
          </div>
        ) : (
          <div
            style={{
              display:             'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap:                 16,
            }}
          >
            {orders.map((order) => {
              const status    = order.status as OrderStatus;
              const accentCol = STATUS_COL_COLOR[status] ?? 'var(--gold)';
              const isPending = pendingIds.has(order.id);
              const btnLabel  = STATUS_BTN_LABEL[status] ?? '';
              const btnArrow  = STATUS_BTN_ARROW[status] ?? '';

              return (
                <div
                  key={order.id}
                  style={{
                    background:  'var(--surface)',
                    border:      `1px solid ${accentCol}44`,
                    borderTop:   `3px solid ${accentCol}`,
                    padding:     24,
                    display:     'flex',
                    flexDirection: 'column',
                    gap:         16,
                  }}
                >
                  {/* Card header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div>
                      <span
                        className={dk.playfair}
                        style={{ fontSize: 32, color: accentCol, lineHeight: 1, display: 'block' }}
                      >
                        {order.orderNumber}
                      </span>
                      <span
                        style={{
                          fontFamily:    'Jost, sans-serif',
                          fontSize:      9,
                          letterSpacing: '0.15em',
                          textTransform: 'uppercase',
                          color:         accentCol,
                          display:       'block',
                          marginTop:     4,
                        }}
                      >
                        {STATUS_LABEL_FR[status]}
                      </span>
                    </div>
                    {/* Elapsed time */}
                    <span
                      style={{
                        fontFamily:  'Jost, sans-serif',
                        fontSize:    11,
                        color:       'var(--cream-dim)',
                        textAlign:   'right',
                        lineHeight:  1.4,
                      }}
                    >
                      {/* tick is only used to force re-render for elapsed time */}
                      {tick >= 0 && elapsedLabel(order.createdAt)}
                    </span>
                  </div>

                  {/* Table info */}
                  {!!(order as unknown as { session?: { table?: unknown } }).session?.table && (
                    <div
                      style={{
                        fontFamily:    'Jost, sans-serif',
                        fontSize:      11,
                        color:         'var(--cream-dim)',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Table {((order as unknown as { session?: { table?: { name?: string; number?: number } } }).session?.table?.name)
                        ?? ((order as unknown as { session?: { table?: { name?: string; number?: number } } }).session?.table?.number)
                        ?? '—'}
                    </div>
                  )}

                  {/* Items list */}
                  <div
                    style={{
                      borderTop:    `1px solid ${accentCol}22`,
                      borderBottom: `1px solid ${accentCol}22`,
                      padding:      '12px 0',
                      display:      'flex',
                      flexDirection: 'column',
                      gap:           8,
                    }}
                  >
                    {order.items.map((item: OrderItemDTO) => (
                      <div
                        key={item.id}
                        style={{
                          display:        'flex',
                          alignItems:     'center',
                          justifyContent: 'space-between',
                          gap:             8,
                        }}
                      >
                        <span
                          style={{
                            fontFamily: 'Jost, sans-serif',
                            fontSize:   14,
                            color:      'var(--cream)',
                            flex:       1,
                          }}
                        >
                          {locale === 'fr' ? item.itemNameFr : item.itemNameEn}
                        </span>
                        <span
                          style={{
                            fontFamily:  'Playfair Display, serif',
                            fontSize:    18,
                            color:       accentCol,
                            fontWeight:  400,
                            flexShrink:  0,
                          }}
                        >
                          × {item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Action button */}
                  <button
                    disabled={isPending || !STATUS_NEXT[status]}
                    onClick={() => handleAdvanceStatus(order)}
                    style={{
                      background:    isPending ? 'transparent' : accentCol,
                      color:         isPending ? accentCol : '#100C07',
                      border:        `1px solid ${accentCol}`,
                      cursor:        isPending ? 'not-allowed' : 'pointer',
                      fontFamily:    'Jost, sans-serif',
                      fontSize:      12,
                      fontWeight:    600,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      padding:       '14px 20px',
                      display:       'flex',
                      alignItems:    'center',
                      justifyContent: 'center',
                      gap:            10,
                      borderRadius:   0,
                      opacity:        isPending ? 0.6 : 1,
                      transition:     'background 0.2s, opacity 0.2s',
                      width:          '100%',
                    }}
                  >
                    {isPending ? 'Mise à jour…' : `${btnLabel} ${btnArrow}`}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
