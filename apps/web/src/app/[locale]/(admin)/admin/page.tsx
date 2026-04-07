'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { formatPrice } from '@/lib/utils';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import dk from '@/styles/dark.module.css';
import type { HotelDailyStatsDTO } from '@repo/shared';

// ── SVG Icons ──────────────────────────────────────────────────────────────────

const IconServices = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3h18M3 8h18M3 13h11M3 18h7" />
  </svg>
);
const IconRooms = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
    <line x1="12" y1="12" x2="12" y2="16" />
    <line x1="10" y1="14" x2="14" y2="14" />
  </svg>
);
const IconRequests = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
    <rect x="9" y="3" width="6" height="4" rx="1" />
    <path d="M9 12h6M9 16h4" />
  </svg>
);
const IconSettings = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
);
const IconStaff = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
  </svg>
);
const IconHistory = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v5h5" />
    <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" />
    <path d="M12 7v5l4 2" />
  </svg>
);

const NAV = [
  { label: 'Services',         sub: 'Catalogue 4 départements', href: 'services',          Icon: IconServices },
  { label: 'Chambres',         sub: 'Codes & QR codes',         href: 'rooms',             Icon: IconRooms    },
  { label: 'Demandes live',    sub: 'Kanban temps réel',        href: 'requests',          Icon: IconRequests },
  { label: 'Historique',       sub: 'Archives & remboursements', href: 'requests/history', Icon: IconHistory  },
  { label: 'Paramètres',       sub: 'Paiements & config',       href: 'settings',          Icon: IconSettings },
  { label: 'Gestion Staff',    sub: 'Comptes du personnel',     href: 'staff',             Icon: IconStaff    },
];

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

export default function AdminDashboard() {
  const locale = useLocale();
  const { user, logout } = useAuth();
  const [stats,   setStats]   = useState<HotelDailyStatsDTO | null>(null);
  const [loading, setLoading] = useState(true);

  const hotelId = (user as any)?.hotelId ?? null;

  useEffect(() => {
    if (!hotelId) return;
    api.get(`/hotels/${hotelId}/stats/today`)
      .then(({ data }) => setStats(data.data))
      .finally(() => setLoading(false));
  }, [hotelId]);

  if (!hotelId) return null;

  return (
    <div className={dk.page}>

      {/* Header */}
      <header className={dk.header} style={{ height: 64 }}>
        <div style={{ flex: 1 }}>
          <span className={dk.playfair} style={{ fontSize: 17, color: 'var(--cream)', display: 'block', lineHeight: 1.2 }}>
            Tableau de bord
          </span>
          <span style={{ fontFamily: 'Jost, sans-serif', fontSize: 10, color: 'var(--cream-dim)', letterSpacing: '0.05em' }}>
            {user?.email}
          </span>
        </div>
        <button className={dk.backBtn} onClick={logout}>Déconnexion</button>
      </header>

      <main className={dk.main}>

        {/* ── Stats aujourd'hui ── */}
        <span className={dk.sectionLabel} style={{ marginBottom: 12, display: 'block' }}>Aujourd&apos;hui</span>

        {loading ? (
          <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 12, color: 'var(--cream-dim)', padding: '20px 0' }}>Chargement…</p>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 16 }}>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', padding: '18px 16px' }}>
                <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--cream-dim)', marginBottom: 10 }}>Demandes</p>
                <p className={dk.playfair} style={{ fontSize: 36, color: 'var(--gold)', lineHeight: 1 }}>{stats?.totalRequests ?? 0}</p>
              </div>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', padding: '18px 16px' }}>
                <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--cream-dim)', marginBottom: 10 }}>Revenus</p>
                <p className={dk.playfair} style={{ fontSize: stats?.totalRevenue ? 22 : 36, color: 'var(--gold)', lineHeight: 1 }}>{formatPrice(stats?.totalRevenue ?? 0)}</p>
              </div>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', padding: '18px 16px' }}>
                <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--cream-dim)', marginBottom: 10 }}>Valeur moy.</p>
                <p className={dk.playfair} style={{ fontSize: stats?.averageRequestValue ? 22 : 36, color: 'var(--cream)', lineHeight: 1 }}>{formatPrice(stats?.averageRequestValue ?? 0)}</p>
              </div>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', padding: '18px 16px' }}>
                <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--cream-dim)', marginBottom: 10 }}>Annulées</p>
                <p className={dk.playfair} style={{ fontSize: 36, color: (stats?.cancelledRequests ?? 0) > 0 ? '#f87171' : 'var(--cream)', lineHeight: 1 }}>{stats?.cancelledRequests ?? 0}</p>
              </div>
            </div>

            {/* Per-department breakdown */}
            {stats?.byDepartment && stats.byDepartment.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 24 }}>
                {stats.byDepartment.map((d) => (
                  <div key={d.department} style={{ background: 'var(--surface)', border: `1px solid ${DEPT_COLORS[d.department] ?? 'var(--line)'}33`, padding: '14px 16px' }}>
                    <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: DEPT_COLORS[d.department] ?? 'var(--cream-dim)', marginBottom: 8 }}>
                      {DEPT_LABELS[d.department] ?? d.department}
                    </p>
                    <p className={dk.playfair} style={{ fontSize: 24, color: 'var(--cream)', lineHeight: 1 }}>{d.totalRequests}</p>
                    <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 10, color: 'var(--cream-dim)', marginTop: 4 }}>{formatPrice(d.totalRevenue)}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Séparateur ── */}
        <div style={{ height: 1, background: 'var(--line)', marginBottom: 24 }} />

        {/* ── Navigation ── */}
        <span className={dk.sectionLabel} style={{ marginBottom: 12, display: 'block' }}>Gestion</span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
          {NAV.map((item) => (
            <Link key={item.href} href={`/${locale}/admin/${item.href}`} style={{ textDecoration: 'none' }}>
              <div
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--line)',
                  padding: '20px 16px',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  minHeight: 110,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--gold)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(240,230,211,0.1)')}
              >
                <span style={{ color: 'var(--gold)' }}><item.Icon /></span>
                <div>
                  <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 13, fontWeight: 600, color: 'var(--cream)', marginBottom: 3 }}>{item.label}</p>
                  <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 10, color: 'var(--cream-dim)', letterSpacing: '0.04em' }}>{item.sub}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </main>
    </div>
  );
}
