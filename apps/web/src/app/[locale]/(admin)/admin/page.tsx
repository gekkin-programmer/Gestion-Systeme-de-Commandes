'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { StatCard } from '@/components/admin/StatCard';
import { formatPrice } from '@/lib/utils';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import dk from '@/styles/dark.module.css';
import type { DailyStatsDTO } from '@/types';

const NAV = [
  { label: 'Menu',        sub: 'Plats & catégories',  href: 'menu',     icon: '🍽' },
  { label: 'Tables',      sub: 'QR codes & statuts',   href: 'tables',   icon: '🪑' },
  { label: 'Commandes',   sub: 'Suivi en temps réel',  href: 'orders',   icon: '📋' },
  { label: 'Paramètres',  sub: 'Paiements & config',   href: 'settings', icon: '⚙️' },
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
        <button className={dk.backBtn} onClick={logout}>
          Déconnexion
        </button>
      </header>

      <main className={dk.main}>

        {/* Stats */}
        <span className={dk.sectionLabel}>Aujourd'hui</span>
        {loading ? (
          <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 12, color: 'var(--cream-dim)', padding: '20px 0' }}>
            Chargement…
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 28 }}>
            <StatCard title="Commandes"    value={stats?.totalOrders ?? 0} />
            <StatCard title="Revenus"      value={formatPrice(stats?.totalRevenue ?? 0)} />
            <StatCard title="Valeur moy."  value={formatPrice(stats?.averageOrderValue ?? 0)} />
            <StatCard title="Annulées"     value={stats?.cancelledOrders ?? 0} />
          </div>
        )}

        {/* Navigation */}
        <span className={dk.sectionLabel}>Gestion</span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={`/${locale}/admin/${item.href}`}
              style={{ textDecoration: 'none' }}
            >
              <div
                className={dk.card}
                style={{
                  marginBottom: 0,
                  cursor: 'pointer',
                  transition: 'border-color 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 28, lineHeight: 1 }}>{item.icon}</span>
                <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 13, fontWeight: 600, color: 'var(--cream)' }}>
                  {item.label}
                </p>
                <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 10, color: 'var(--cream-dim)', letterSpacing: '0.04em' }}>
                  {item.sub}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
