'use client';

import { useLocale, useTranslations } from 'next-intl';
import { formatPrice } from '@/lib/utils';
import dk from '@/styles/dark.module.css';
import type { OrderDTO } from '@/types';
import type { OrderStatus } from '@repo/shared';
import { ORDER_STATUS } from '@repo/shared';

const STATUS_COLUMNS: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'];

const STATUS_COLORS: Record<string, string> = {
  PENDING:   '#A89880',
  CONFIRMED: '#C8A96E',
  PREPARING: '#d4a04a',
  READY:     '#6fcf6f',
};

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  PENDING:   'CONFIRMED',
  CONFIRMED: 'PREPARING',
  PREPARING: 'READY',
  READY:     'SERVED',
};

interface OrderKanbanBoardProps {
  orders:         OrderDTO[];
  onStatusChange: (orderId: string, status: string) => Promise<void>;
  pendingIds?:    Set<string>;
}

export function OrderKanbanBoard({ orders, onStatusChange, pendingIds }: OrderKanbanBoardProps) {
  const t      = useTranslations('order.status');
  const locale = useLocale();

  return (
    <div className={dk.kanbanWrap}>
      {STATUS_COLUMNS.map((status) => {
        const columnOrders = orders.filter((o) => o.status === status);
        return (
          <div key={status} className={dk.kanbanCol}>
            <div className={dk.kanbanColHeader}>
              <span style={{ color: STATUS_COLORS[status] }}>{t(status as any)}</span>
              <span className={dk.kanbanCount}>{columnOrders.length}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {columnOrders.map((order) => {
                const nextStatus = NEXT_STATUS[status];
                return (
                  <div
                    key={order.id}
                    style={{
                      background: 'var(--bg)',
                      border: '1px solid var(--line)',
                      padding: '12px 14px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontFamily: 'Jost, sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--cream)', textTransform: 'uppercase' }}>
                        {order.orderNumber}
                        {pendingIds?.has(order.id) && (
                          <span title="Sync en attente" style={{ marginLeft: 6, fontSize: 10, color: '#d4a04a' }}>⏳</span>
                        )}
                      </span>
                      <span style={{ fontFamily: 'Jost, sans-serif', fontSize: 10, color: 'var(--cream-dim)' }}>
                        {new Date(order.createdAt).toLocaleTimeString(
                          locale === 'fr' ? 'fr-FR' : 'en-US',
                          { hour: '2-digit', minute: '2-digit' },
                        )}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontFamily: 'Jost, sans-serif', fontSize: 11, color: 'var(--cream-dim)' }}>
                        {order.items.length} article{order.items.length > 1 ? 's' : ''}
                      </span>
                      <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 14, color: 'var(--gold)' }}>
                        {formatPrice(order.totalAmount)}
                      </span>
                    </div>

                    {order.notes && (
                      <div style={{
                        background: 'rgba(200,169,110,0.07)',
                        border: '1px solid rgba(200,169,110,0.2)',
                        padding: '6px 10px',
                        marginBottom: 8,
                        fontFamily: 'Jost, sans-serif',
                        fontSize: 11,
                        color: 'var(--cream-dim)',
                      }}>
                        {order.notes}
                      </div>
                    )}

                    {nextStatus && (
                      <button
                        className={dk.btn}
                        style={{ width: '100%', fontSize: 9, padding: '10px 12px', marginBottom: 6 }}
                        onClick={() => onStatusChange(order.id, nextStatus)}
                      >
                        {t(nextStatus as any)}
                      </button>
                    )}

                    {status === 'PENDING' && (
                      <button
                        className={dk.btnDanger}
                        style={{ width: '100%', fontSize: 9, padding: '8px 12px' }}
                        onClick={() => onStatusChange(order.id, ORDER_STATUS.CANCELLED)}
                      >
                        Annuler
                      </button>
                    )}
                  </div>
                );
              })}

              {columnOrders.length === 0 && (
                <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 11, color: 'var(--cream-dim)', textAlign: 'center', padding: '20px 0', opacity: 0.6 }}>
                  Aucune commande
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
