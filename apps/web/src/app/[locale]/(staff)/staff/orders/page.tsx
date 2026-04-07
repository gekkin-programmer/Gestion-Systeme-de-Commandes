'use client';

import { useEffect, useState } from 'react';
import { RequestKanbanBoard } from '@/components/staff/RequestKanbanBoard';
import { Toast } from '@/components/shared/Toast';
import { useAuth } from '@/hooks/useAuth';
import { useRequests, useSyncRequestQueue } from '@/hooks/useRequests';
import { useHotelSocket } from '@/hooks/useSocket';
import { useNotification } from '@/hooks/useNotification';
import dk from '@/styles/dark.module.css';
import type { ServiceRequestDTO } from '@/types';

const DEPT_OPTIONS = [
  { value: '',             label: 'Tous les départements' },
  { value: 'ROOM_SERVICE', label: 'Room Service' },
  { value: 'HOUSEKEEPING', label: 'Ménage' },
  { value: 'CONCIERGE',    label: 'Conciergerie' },
  { value: 'SPA',          label: 'Spa' },
];

export default function StaffRequestsPage() {
  const { user, accessToken, logout } = useAuth();
  const hotelId       = (user as any)?.hotelId ?? '';
  const userDept      = (user as any)?.departmentType ?? null;

  // Staff with assigned dept are locked to it; all-dept staff can filter
  const [deptFilter, setDeptFilter] = useState<string>(userDept ?? '');

  const { requests, loading, fetchRequests, updateRequestStatus, addRequest, setRequests, pendingIds } =
    useRequests(hotelId, deptFilter || undefined);
  useSyncRequestQueue(updateRequestStatus);
  const { playNewOrderSound, showBrowserNotification } = useNotification();
  const [toast, setToast] = useState<string | null>(null);

  // Staff joined to their dept socket automatically via useHotelSocket
  useHotelSocket(accessToken, userDept, {
    onRequestNew: (r: unknown) => {
      const req = r as ServiceRequestDTO;
      // Only show if matches current filter
      if (!deptFilter || req.department === deptFilter) {
        addRequest(req);
        playNewOrderSound();
        showBrowserNotification('Nouvelle demande', `${req.requestNumber} — ${req.department}`);
      }
    },
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

  if (!hotelId) {
    return (
      <div className={dk.page} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p className={dk.errorText}>Accès non autorisé</p>
      </div>
    );
  }

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

      <header className={dk.header} style={{ height: 64 }}>
        <div style={{ flex: 1 }}>
          <span className={dk.playfair} style={{ fontSize: 17, color: 'var(--cream)', display: 'block', lineHeight: 1.2 }}>
            Demandes
          </span>
          <span style={{ fontFamily: 'Jost, sans-serif', fontSize: 10, color: 'var(--cream-dim)', letterSpacing: '0.05em' }}>
            {user?.email}
          </span>
        </div>

        <div className={dk.headerRight}>
          {/* Dept filter — only shown for all-dept staff */}
          {!userDept && (
            <select style={selectStyle} value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
              {DEPT_OPTIONS.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          )}

          <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 13, color: 'var(--gold)', border: '1px solid var(--line)', padding: '3px 10px' }}>
            {activeRequests.length} active{activeRequests.length !== 1 ? 's' : ''}
          </span>

          <button className={dk.backBtn} onClick={logout} style={{ marginLeft: 4 }}>
            Déconnexion
          </button>
        </div>
      </header>

      <main style={{ padding: '24px 20px 40px', maxWidth: 1200, margin: '0 auto' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
            <span className={dk.playfair} style={{ fontSize: 18, color: 'var(--cream-dim)' }}>
              Chargement des demandes…
            </span>
          </div>
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
