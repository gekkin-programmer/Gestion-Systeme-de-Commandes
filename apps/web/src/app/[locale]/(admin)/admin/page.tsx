'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { formatPrice } from '@/lib/utils';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import dk from '@/styles/dark.module.css';
import type { DailyStatsDTO } from '@/types';

// ── SVG Icons ──────────────────────────────────────────────────────────────────

const IconMenu = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3h18M3 8h18M3 13h11M3 18h7" />
  </svg>
);
const IconTable = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="4" rx="1" />
    <path d="M5 7v14M19 7v14M8 21h8" />
  </svg>
);
const IconOrders = () => (
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
const IconKDS = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <path d="M8 21h8M12 17v4" />
    <path d="M7 8l3 3 4-4" />
  </svg>
);

const NAV = [
  { label: 'Menu',          sub: 'Plats & catégories',   href: 'menu',     Icon: IconMenu,     external: false },
  { label: 'Tables',        sub: 'QR codes & statuts',   href: 'tables',   Icon: IconTable,    external: false },
  { label: 'Commandes',     sub: 'Suivi en temps réel',  href: 'orders',   Icon: IconOrders,   external: false },
  { label: 'Paramètres',    sub: 'Paiements & config',   href: 'settings', Icon: IconSettings, external: false },
  { label: 'Gestion Staff', sub: 'Comptes du personnel', href: 'staff',    Icon: IconStaff,    external: false },
  { label: 'Cuisine (KDS)', sub: 'Affichage cuisine',    href: 'kitchen',  Icon: IconKDS,      external: true  },
];

export default function AdminDashboard() {
  const locale = useLocale();
  const { user, logout } = useAuth();
  const [stats,   setStats]   = useState<DailyStatsDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.restaurantId) return;
    api.get(`/restaurants/${user.restaurantId}/stats/today`)
      .then(({ data }) => setStats(data.data))
      .finally(() => setLoading(false));
  }, [user?.restaurantId]);

  if (!user?.restaurantId) return null;

  return (
    <div className={dk.page}>

      {/* Header */}
      <header className={dk.header} style={{ height: 64 }}>
        <div style={{ flex: 1 }}>
          <span className={dk.playfair} style={{ fontSize: 17, color: 'var(--cream)', display: 'block', lineHeight: 1.2 }}>
            Tableau de bord
          </span>
          <span style={{ fontFamily: 'Jost, sans-serif', fontSize: 10, color: 'var(--cream-dim)', letterSpacing: '0.05em' }}>
            {user.email}
          </span>
        </div>
        <button className={dk.backBtn} onClick={logout}>Déconnexion</button>
      </header>

      <main className={dk.main}>

        {/* ── Stats ── */}
        <span className={dk.sectionLabel} style={{ marginBottom: 12, display: 'block' }}>Aujourd&apos;hui</span>

        {loading ? (
          <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 12, color: 'var(--cream-dim)', padding: '20px 0' }}>Chargement…</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 32 }}>
            {/* Commandes */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', padding: '18px 16px' }}>
              <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--cream-dim)', marginBottom: 10 }}>Commandes</p>
              <p className={dk.playfair} style={{ fontSize: 36, color: 'var(--gold)', lineHeight: 1 }}>{stats?.totalOrders ?? 0}</p>
            </div>

            {/* Revenus */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', padding: '18px 16px' }}>
              <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--cream-dim)', marginBottom: 10 }}>Revenus</p>
              <p className={dk.playfair} style={{ fontSize: stats?.totalRevenue ? 22 : 36, color: 'var(--gold)', lineHeight: 1 }}>{formatPrice(stats?.totalRevenue ?? 0)}</p>
            </div>

            {/* Valeur moy */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', padding: '18px 16px' }}>
              <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--cream-dim)', marginBottom: 10 }}>Valeur moy.</p>
              <p className={dk.playfair} style={{ fontSize: stats?.averageOrderValue ? 22 : 36, color: 'var(--cream)', lineHeight: 1 }}>{formatPrice(stats?.averageOrderValue ?? 0)}</p>
            </div>

            {/* Annulées */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', padding: '18px 16px' }}>
              <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--cream-dim)', marginBottom: 10 }}>Annulées</p>
              <p className={dk.playfair} style={{ fontSize: 36, color: (stats?.cancelledOrders ?? 0) > 0 ? '#f87171' : 'var(--cream)', lineHeight: 1 }}>{stats?.cancelledOrders ?? 0}</p>
            </div>
          </div>
        )}

        {/* ── Séparateur ── */}
        <div style={{ height: 1, background: 'var(--line)', marginBottom: 24 }} />

        {/* ── Navigation ── */}
        <span className={dk.sectionLabel} style={{ marginBottom: 12, display: 'block' }}>Gestion</span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
          {NAV.map((item) => {
            const dest = item.external ? `/${locale}/staff/${item.href}` : `/${locale}/admin/${item.href}`;
            return (
              <Link key={item.href} href={dest} style={{ textDecoration: 'none' }}>
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
                    <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 13, fontWeight: 600, color: 'var(--cream)', marginBottom: 3 }}>
                      {item.label}
                    </p>
                    <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 10, color: 'var(--cream-dim)', letterSpacing: '0.04em' }}>
                      {item.sub}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

      </main>
    </div>
  );
}
