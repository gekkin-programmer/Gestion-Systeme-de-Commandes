'use client';

import { useLocale } from 'next-intl';
import { formatPrice } from '@/lib/utils';
import dk from '@/styles/dark.module.css';
import type { ServiceRequestDTO } from '@/types';
import { REQUEST_STATUS } from '@repo/shared';

type RequestStatus = 'RECEIVED' | 'IN_PROGRESS' | 'COMPLETED' | 'DELIVERED' | 'CANCELLED';

const STATUS_COLUMNS: RequestStatus[] = ['RECEIVED', 'IN_PROGRESS', 'COMPLETED', 'DELIVERED'];

const STATUS_LABELS: Record<string, string> = {
  RECEIVED:    'Reçue',
  IN_PROGRESS: 'En cours',
  COMPLETED:   'Complétée',
  DELIVERED:   'Livrée',
  CANCELLED:   'Annulée',
};

const STATUS_COLORS: Record<string, string> = {
  RECEIVED:    '#A89880',
  IN_PROGRESS: '#d4a04a',
  COMPLETED:   '#6fcf6f',
  DELIVERED:   '#4ade80',
};

const DEPT_COLORS: Record<string, string> = {
  ROOM_SERVICE: '#f59e0b',
  HOUSEKEEPING: '#3b82f6',
  CONCIERGE:    '#8b5cf6',
  SPA:          '#ec4899',
};

const DEPT_LABELS: Record<string, string> = {
  ROOM_SERVICE: 'Room Service',
  HOUSEKEEPING: 'Ménage',
  CONCIERGE:    'Conciergerie',
  SPA:          'Spa',
};

const NEXT_STATUS: Partial<Record<RequestStatus, RequestStatus>> = {
  RECEIVED:    'IN_PROGRESS',
  IN_PROGRESS: 'COMPLETED',
  COMPLETED:   'DELIVERED',
};

interface RequestKanbanBoardProps {
  requests:       ServiceRequestDTO[];
  onStatusChange: (requestId: string, status: string) => Promise<void>;
  pendingIds?:    Set<string>;
  showDept?:      boolean;
}

export function RequestKanbanBoard({ requests, onStatusChange, pendingIds, showDept = true }: RequestKanbanBoardProps) {
  const locale = useLocale();

  return (
    <div className={dk.kanbanWrap}>
      {STATUS_COLUMNS.map((status) => {
        const columnRequests = requests.filter((r) => r.status === status);
        return (
          <div key={status} className={dk.kanbanCol}>
            <div className={dk.kanbanColHeader}>
              <span style={{ color: STATUS_COLORS[status] }}>{STATUS_LABELS[status]}</span>
              <span className={dk.kanbanCount}>{columnRequests.length}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {columnRequests.map((request) => {
                const nextStatus  = NEXT_STATUS[status];
                const deptColor   = DEPT_COLORS[request.department] ?? 'var(--gold)';
                const deptLabel   = DEPT_LABELS[request.department] ?? request.department;
                const roomNumber  = (request as any).roomStay?.room?.roomNumber;
                const floor       = (request as any).roomStay?.room?.floor;
                const isPending   = pendingIds?.has(request.id);

                return (
                  <div
                    key={request.id}
                    style={{
                      background:  'var(--bg)',
                      border:      `1px solid ${deptColor}33`,
                      padding:     '12px 14px',
                    }}
                  >
                    {/* Header row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontFamily: 'Jost, sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--cream)', textTransform: 'uppercase' }}>
                        {request.requestNumber}
                        {isPending && <span title="Sync en attente" style={{ marginLeft: 6, fontSize: 10, color: '#d4a04a' }}>⏳</span>}
                      </span>
                      <span style={{ fontFamily: 'Jost, sans-serif', fontSize: 10, color: 'var(--cream-dim)' }}>
                        {new Date(request.createdAt).toLocaleTimeString(
                          locale === 'fr' ? 'fr-FR' : 'en-US',
                          { hour: '2-digit', minute: '2-digit' },
                        )}
                      </span>
                    </div>

                    {/* Room info */}
                    {roomNumber && (
                      <div style={{ marginBottom: 4 }}>
                        <span style={{ fontFamily: 'Jost, sans-serif', fontSize: 11, color: 'var(--gold)' }}>
                          Chambre {roomNumber}{floor ? ` — Ét. ${floor}` : ''}
                        </span>
                      </div>
                    )}

                    {/* Department badge */}
                    {showDept && (
                      <div style={{ marginBottom: 6 }}>
                        <span style={{
                          fontFamily: 'Jost, sans-serif', fontSize: 9, letterSpacing: '0.12em',
                          textTransform: 'uppercase', color: deptColor,
                          border: `1px solid ${deptColor}55`, padding: '2px 6px',
                        }}>
                          {deptLabel}
                        </span>
                      </div>
                    )}

                    {/* Items count + amount */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontFamily: 'Jost, sans-serif', fontSize: 11, color: 'var(--cream-dim)' }}>
                        {request.items.length} article{request.items.length > 1 ? 's' : ''}
                      </span>
                      <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 14, color: 'var(--gold)' }}>
                        {formatPrice(request.totalAmount)}
                      </span>
                    </div>

                    {/* Notes */}
                    {request.notes && (
                      <div style={{
                        background: 'rgba(200,169,110,0.07)',
                        border: '1px solid rgba(200,169,110,0.2)',
                        padding: '6px 10px',
                        marginBottom: 8,
                        fontFamily: 'Jost, sans-serif',
                        fontSize: 11,
                        color: 'var(--cream-dim)',
                      }}>
                        {request.notes}
                      </div>
                    )}

                    {/* Advance button */}
                    {nextStatus && (
                      <button
                        className={dk.btn}
                        style={{ width: '100%', fontSize: 9, padding: '10px 12px', marginBottom: 6, opacity: isPending ? 0.5 : 1 }}
                        disabled={isPending}
                        onClick={() => onStatusChange(request.id, nextStatus)}
                      >
                        → {STATUS_LABELS[nextStatus]}
                      </button>
                    )}

                    {/* Cancel button for early statuses */}
                    {(status === 'RECEIVED' || status === 'IN_PROGRESS') && (
                      <button
                        className={dk.btnDanger}
                        style={{ width: '100%', fontSize: 9, padding: '8px 12px', opacity: isPending ? 0.5 : 1 }}
                        disabled={isPending}
                        onClick={() => onStatusChange(request.id, REQUEST_STATUS.CANCELLED)}
                      >
                        Annuler
                      </button>
                    )}
                  </div>
                );
              })}

              {columnRequests.length === 0 && (
                <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 11, color: 'var(--cream-dim)', textAlign: 'center', padding: '20px 0', opacity: 0.6 }}>
                  Aucune demande
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
