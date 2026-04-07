'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { RequestKanbanBoard } from '@/components/staff/RequestKanbanBoard';
import { BackButton } from '@/components/shared/BackButton';
import { Toast } from '@/components/shared/Toast';
import { useAuth } from '@/hooks/useAuth';
import { useRequests, useSyncRequestQueue } from '@/hooks/useRequests';
import { useHotelSocket } from '@/hooks/useSocket';
import dk from '@/styles/dark.module.css';
import type { ServiceRequestDTO } from '@/types';

const DEPT_OPTIONS = [
  { value: '',             label: 'Tous' },
  { value: 'ROOM_SERVICE', label: 'Room Service' },
  { value: 'HOUSEKEEPING', label: 'Ménage' },
  { value: 'CONCIERGE',    label: 'Conciergerie' },
  { value: 'SPA',          label: 'Spa' },
];

export default function AdminRequestsPage() {
  const locale                   = useLocale();
  const { user, accessToken }    = useAuth();
  const hotelId                  = (user as any)?.hotelId ?? '';
  const [deptFilter, setDeptFilter] = useState('');

  const { requests, loading, fetchRequests, updateRequestStatus, addRequest, setRequests, pendingIds } =
    useRequests(hotelId, deptFilter || undefined);
  useSyncRequestQueue(updateRequestStatus);
  const [toast, setToast] = useState<string | null>(null);

  useHotelSocket(accessToken, null, {
    onRequestNew: (r: unknown) => { addRequest(r as ServiceRequestDTO); },
    onRequestStatusChanged: (updated: unknown) => {
      const r = updated as ServiceRequestDTO;
      setRequests((prev) => prev.map((x) => x.id === r.id ? r : x));
      if (r.status === 'DELIVERED') {
        const room = (r as any).roomStay?.room;
        const label = room ? ` — Chambre ${room.roomNumber}` : '';
        setToast(`${r.requestNumber}${label} — livrée ✓`);
      }
    },
  });

  useEffect(() => {
    if (hotelId) fetchRequests();
  }, [hotelId, deptFilter]);

  const activeRequests = requests.filter((r) => !['DELIVERED', 'CANCELLED'].includes(r.status));

  const selectStyle: React.CSSProperties = {
    background: 'var(--surface)',
    border: '1px solid var(--line)',
    color: 'var(--cream)',
    fontFamily: 'Jost, sans-serif',
    fontSize: 11,
    padding: '5px 10px',
    cursor: 'pointer',
    outline: 'none',
  };

  return (
    <div className={dk.page} style={{ minHeight: '100vh' }}>

      {toast && (
        <Toast message={toast} color="#4ade80" duration={5000} onClose={() => setToast(null)} />
      )}

      <header className={dk.header}>
        <BackButton />
        <span className={dk.headerTitle}>Demandes en cours</span>
        <div className={dk.headerRight} style={{ gap: 10 }}>
          <select style={selectStyle} value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
            {DEPT_OPTIONS.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
          <Link href={`/${locale}/admin/requests/history`}>
            <button className={dk.btnOutline} style={{ fontSize: 9, padding: '6px 14px' }}>
              Historique
            </button>
          </Link>
          <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 14, color: 'var(--gold)', border: '1px solid var(--line)', padding: '3px 10px' }}>
            {activeRequests.length}
          </span>
        </div>
      </header>

      <main style={{ padding: '24px 20px 40px', maxWidth: 1200, margin: '0 auto' }}>
        {loading ? (
          <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 12, color: 'var(--cream-dim)', textAlign: 'center', padding: '40px 0' }}>
            Chargement…
          </p>
        ) : (
          <RequestKanbanBoard
            requests={activeRequests}
            onStatusChange={async (id, status) => { await updateRequestStatus(id, status); }}
            pendingIds={pendingIds}
            showDept={!deptFilter}
          />
        )}
      </main>
    </div>
  );
}
