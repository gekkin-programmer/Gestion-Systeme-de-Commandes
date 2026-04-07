'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { BackButton } from '@/components/shared/BackButton';
import { formatPrice } from '@/lib/utils';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import dk from '@/styles/dark.module.css';
import type { ServiceRequestDTO } from '@/types';

type RequestStatus = 'RECEIVED' | 'IN_PROGRESS' | 'COMPLETED' | 'DELIVERED' | 'CANCELLED';

const STATUS_LABEL: Partial<Record<RequestStatus, string>> = {
  RECEIVED:    'Reçue',
  IN_PROGRESS: 'En cours',
  COMPLETED:   'Complétée',
  DELIVERED:   'Livrée',
  CANCELLED:   'Annulée',
};

const STATUS_COLOR: Partial<Record<RequestStatus, string>> = {
  RECEIVED:    'var(--cream-dim)',
  IN_PROGRESS: 'var(--gold)',
  COMPLETED:   'var(--gold)',
  DELIVERED:   '#4ade80',
  CANCELLED:   '#f87171',
};

const DEPT_LABELS: Record<string, string> = {
  ROOM_SERVICE: 'Room Service',
  HOUSEKEEPING: 'Ménage',
  CONCIERGE:    'Conciergerie',
  SPA:          'Spa',
};

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export default function RequestHistoryPage() {
  const { user }  = useAuth();
  const hotelId   = (user as any)?.hotelId ?? '';

  const [date,        setDate]        = useState(todayISO());
  const [requests,    setRequests]    = useState<ServiceRequestDTO[]>([]);
  const [loading,     setLoading]     = useState(false);
  const [refundingId, setRefundingId] = useState<string | null>(null);
  const [refundError, setRefundError] = useState<string | null>(null);

  const handleRefund = useCallback(async (requestId: string) => {
    setRefundingId(requestId);
    setRefundError(null);
    try {
      await api.post(`/payments/${requestId}/refund`);
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? { ...r, payment: r.payment ? { ...r.payment, status: 'REFUNDED' } : r.payment }
            : r,
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
    if (!hotelId) return;
    setLoading(true);
    api.get(`/requests/hotel/${hotelId}?date=${date}`)
      .then(({ data }) => setRequests(data.data))
      .finally(() => setLoading(false));
  }, [hotelId, date]);

  const summary = useMemo(() => {
    const total   = requests.filter((r) => r.status !== 'CANCELLED').length;
    const revenue = requests
      .filter((r) => r.status === 'DELIVERED')
      .reduce((s, r) => s + r.totalAmount, 0);
    const paid    = requests.filter((r) => r.payment?.status === 'PAID').length;
    return { total, revenue, paid };
  }, [requests]);

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
            style={{ background: 'none', border: '1px solid var(--line)', color: 'var(--cream-dim)', fontFamily: 'Jost, sans-serif', fontSize: 11, padding: '4px 8px', cursor: 'pointer' }}
          />
        </div>
      </header>

      <main className={dk.main}>

        <div className={dk.summaryStrip}>
          <div className={dk.summaryCell}>
            <span className={dk.summaryCellLabel}>Demandes</span>
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

        {loading ? (
          <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 12, color: 'var(--cream-dim)', textAlign: 'center', padding: '40px 0' }}>
            Chargement…
          </p>
        ) : requests.length === 0 ? (
          <div className={dk.card} style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 13, color: 'var(--cream-dim)' }}>
              Aucune demande ce jour.
            </p>
          </div>
        ) : (
          <div className={dk.card} style={{ padding: 0, overflow: 'hidden' }}>
            {requests.map((request) => {
              const color      = STATUS_COLOR[request.status as RequestStatus] ?? 'var(--cream-dim)';
              const isPaid     = request.payment?.status === 'PAID';
              const isRefunded = request.payment?.status === 'REFUNDED';
              const isRefunding = refundingId === request.id;
              const room       = (request as any).roomStay?.room;

              return (
                <div key={request.id} style={{ borderBottom: '1px solid var(--line)' }}>
                  <div className={dk.historyRow} style={{ borderBottom: 'none' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 60 }}>
                      <span style={{ fontFamily: 'Jost, sans-serif', fontSize: 12, color: 'var(--cream)' }}>
                        {formatTime(request.createdAt)}
                      </span>
                      <span style={{ fontFamily: 'Jost, sans-serif', fontSize: 9, letterSpacing: '0.1em', color: 'var(--cream-dim)' }}>
                        {request.requestNumber}
                      </span>
                    </div>

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span style={{ fontFamily: 'Jost, sans-serif', fontSize: 11, color }}>
                        {STATUS_LABEL[request.status as RequestStatus] ?? request.status}
                      </span>
                      <span style={{ fontFamily: 'Jost, sans-serif', fontSize: 10, color: 'var(--cream-dim)' }}>
                        {DEPT_LABELS[request.department] ?? request.department}
                        {room ? ` · Ch. ${room.roomNumber}` : ''}
                      </span>
                    </div>

                    {isRefunded && (
                      <span style={{ fontFamily: 'Jost, sans-serif', fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#94a3b8', border: '1px solid rgba(148,163,184,0.35)', padding: '2px 6px', flexShrink: 0 }}>
                        Remboursé
                      </span>
                    )}

                    <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 14, color: 'var(--gold)', flexShrink: 0 }}>
                      {formatPrice(request.totalAmount)}
                    </span>
                  </div>

                  {isPaid && (
                    <div style={{ padding: '0 16px 12px', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                      <a
                        href={`${process.env.NEXT_PUBLIC_API_URL}/receipts/${request.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <button className={dk.btnOutline} style={{ fontSize: 9, padding: '5px 14px' }}>
                          Reçu PDF
                        </button>
                      </a>
                      {!isRefunded && (
                        <button
                          className={dk.btnDanger}
                          style={{ fontSize: 9, padding: '5px 14px' }}
                          disabled={isRefunding}
                          onClick={() => handleRefund(request.id)}
                        >
                          {isRefunding ? 'Remboursement…' : 'Rembourser'}
                        </button>
                      )}
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
