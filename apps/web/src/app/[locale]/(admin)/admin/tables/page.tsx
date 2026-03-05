'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { TableQRCard } from '@/components/admin/TableQRCard';
import { BackButton } from '@/components/shared/BackButton';
import { formatPrice } from '@/lib/utils';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useRestaurantSocket } from '@/hooks/useSocket';
import dk from '@/styles/dark.module.css';
import type { TableDTO } from '@/types';

interface OccupancyData {
  sessionId:    string;
  createdAt:    string;
  expiresAt:    string;
  ordersCount:  number;
  totalAmount:  number;
  unpaidAmount: number;
}

interface TableWithOccupancy extends TableDTO {
  occupancy: OccupancyData | null;
}

function sessionDuration(createdAt: string) {
  const ms = Date.now() - new Date(createdAt).getTime();
  const m  = Math.floor(ms / 60_000);
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)}h${String(m % 60).padStart(2, '0')}`;
}

type Tab = 'qr' | 'occupancy';

export default function TablesAdminPage() {
  const locale       = useLocale();
  const { user, accessToken } = useAuth();
  const restaurantId = user?.restaurantId ?? '';

  const [tab,      setTab]      = useState<Tab>('qr');
  const [tables,   setTables]   = useState<TableDTO[]>([]);
  const [occupancy, setOccupancy] = useState<TableWithOccupancy[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [occLoading, setOccLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ number: '', label: '', capacity: '4' });

  // Load QR tables list
  useEffect(() => {
    if (!restaurantId) return;
    api.get(`/tables/${restaurantId}`)
      .then(({ data }) => setTables(data.data))
      .finally(() => setLoading(false));
  }, [restaurantId]);

  // Load occupancy data
  const loadOccupancy = useCallback(() => {
    if (!restaurantId) return;
    setOccLoading(true);
    api.get(`/tables/${restaurantId}/occupancy`)
      .then(({ data }) => setOccupancy(data.data))
      .finally(() => setOccLoading(false));
  }, [restaurantId]);

  useEffect(() => {
    if (tab === 'occupancy') loadOccupancy();
  }, [tab, loadOccupancy]);

  // Real-time: refresh occupancy on table status change or new order
  useRestaurantSocket(accessToken, {
    onTableStatusChanged: () => { if (tab === 'occupancy') loadOccupancy(); },
    onOrderNew:           () => { if (tab === 'occupancy') loadOccupancy(); },
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const { data } = await api.post(`/tables/${restaurantId}`, {
        number:   parseInt(formData.number),
        label:    formData.label,
        capacity: parseInt(formData.capacity),
      });
      setTables((prev) => [...prev, data.data]);
      setShowForm(false);
      setFormData({ number: '', label: '', capacity: '4' });
    } finally {
      setCreating(false);
    }
  };

  // Count occupied tables
  const occupiedCount = occupancy.filter((t) => t.occupancy !== null).length;

  return (
    <div className={dk.page}>

      {/* Header */}
      <header className={dk.header}>
        <BackButton />
        <span className={dk.headerTitle}>Tables</span>
        <div className={dk.headerRight} style={{ gap: 8 }}>
          {tab === 'qr' && (
            <>
              <Link href={`/${locale}/admin/tables/print`}>
                <button className={dk.btnOutline} style={{ fontSize: 9, padding: '6px 14px' }}>
                  Imprimer QR
                </button>
              </Link>
              <button
                className={dk.btn}
                style={{ fontSize: 9, padding: '8px 14px' }}
                onClick={() => setShowForm((v) => !v)}
              >
                + Table
              </button>
            </>
          )}
          {tab === 'occupancy' && (
            <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 14, color: 'var(--gold)', border: '1px solid var(--line)', padding: '3px 10px' }}>
              {occupiedCount} / {occupancy.length}
            </span>
          )}
        </div>
      </header>

      <main className={dk.main}>

        {/* Tab bar */}
        <div className={dk.tabBar}>
          <button
            className={`${dk.tab} ${tab === 'qr' ? dk.tabActive : ''}`}
            onClick={() => setTab('qr')}
          >
            QR Codes
          </button>
          <button
            className={`${dk.tab} ${tab === 'occupancy' ? dk.tabActive : ''}`}
            onClick={() => setTab('occupancy')}
          >
            Occupation
          </button>
        </div>

        {/* ── QR tab ── */}
        {tab === 'qr' && (
          <>
            {showForm && (
              <div className={dk.card}>
                <span className={dk.sectionLabel}>Nouvelle table</span>
                <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  <div className={dk.inputGroup}>
                    <label className={dk.inputLabel} htmlFor="num">Numéro</label>
                    <input id="num" type="number" className={dk.input}
                      value={formData.number}
                      onChange={(e) => setFormData((p) => ({ ...p, number: e.target.value }))}
                      required />
                  </div>
                  <div className={dk.inputGroup}>
                    <label className={dk.inputLabel} htmlFor="lbl">Label</label>
                    <input id="lbl" type="text" className={dk.input}
                      value={formData.label}
                      placeholder="Table 1 — Terrasse"
                      onChange={(e) => setFormData((p) => ({ ...p, label: e.target.value }))}
                      required />
                  </div>
                  <div className={dk.inputGroup}>
                    <label className={dk.inputLabel} htmlFor="cap">Capacité</label>
                    <input id="cap" type="number" className={dk.input}
                      value={formData.capacity}
                      onChange={(e) => setFormData((p) => ({ ...p, capacity: e.target.value }))} />
                  </div>
                  <button type="submit" className={dk.btn} disabled={creating} style={{ width: '100%', marginTop: 4 }}>
                    {creating ? 'Création…' : 'Créer la table'}
                  </button>
                </form>
              </div>
            )}

            {loading ? (
              <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 12, color: 'var(--cream-dim)', textAlign: 'center', padding: '40px 0' }}>
                Chargement…
              </p>
            ) : tables.length === 0 ? (
              <div className={dk.card} style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 13, color: 'var(--cream-dim)' }}>
                  Aucune table. Commencez par en créer une.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                {tables.map((table) => (
                  <TableQRCard
                    key={table.id}
                    table={table}
                    restaurantId={restaurantId}
                    onUpdated={(updated) =>
                      setTables((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
                    }
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Occupancy tab ── */}
        {tab === 'occupancy' && (
          <>
            {occLoading ? (
              <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 12, color: 'var(--cream-dim)', textAlign: 'center', padding: '40px 0' }}>
                Chargement…
              </p>
            ) : occupancy.length === 0 ? (
              <div className={dk.card} style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 13, color: 'var(--cream-dim)' }}>
                  Aucune table configurée.
                </p>
              </div>
            ) : (
              <>
                {/* Summary strip */}
                <div className={dk.summaryStrip} style={{ marginBottom: 16 }}>
                  <div className={dk.summaryCell}>
                    <span className={dk.summaryCellLabel}>Occupées</span>
                    <span className={dk.summaryCellValue}>{occupiedCount}</span>
                  </div>
                  <div className={dk.summaryCell}>
                    <span className={dk.summaryCellLabel}>Libres</span>
                    <span className={dk.summaryCellValue}>{occupancy.length - occupiedCount}</span>
                  </div>
                  <div className={dk.summaryCell}>
                    <span className={dk.summaryCellLabel}>Impayé</span>
                    <span className={dk.summaryCellValue}>
                      {formatPrice(occupancy.reduce((s, t) => s + (t.occupancy?.unpaidAmount ?? 0), 0))}
                    </span>
                  </div>
                </div>

                {/* Table cards */}
                <div className={dk.occupancyGrid}>
                  {occupancy.map((table) => {
                    const occ      = table.occupancy;
                    const occupied = occ !== null;
                    return (
                      <div
                        key={table.id}
                        className={`${dk.occupancyCard} ${occupied ? dk.occupancyCardOccupied : ''}`}
                      >
                        {/* Status dot */}
                        <span
                          className={dk.occupancyStatus}
                          style={{ background: occupied ? 'var(--gold)' : 'var(--cream-dim)' }}
                        />

                        <div className={dk.occupancyTableNum}>{table.number}</div>
                        <div className={dk.occupancyTableLabel}>{table.label}</div>

                        {occupied && occ ? (
                          <>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontFamily: 'Jost, sans-serif', fontSize: 9, letterSpacing: '0.12em', color: 'var(--cream-dim)', textTransform: 'uppercase' }}>
                                  Commandes
                                </span>
                                <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 13, color: 'var(--cream)' }}>
                                  {occ.ordersCount}
                                </span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontFamily: 'Jost, sans-serif', fontSize: 9, letterSpacing: '0.12em', color: 'var(--cream-dim)', textTransform: 'uppercase' }}>
                                  Total
                                </span>
                                <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 13, color: 'var(--gold)' }}>
                                  {formatPrice(occ.totalAmount)}
                                </span>
                              </div>
                              {occ.unpaidAmount > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ fontFamily: 'Jost, sans-serif', fontSize: 9, letterSpacing: '0.12em', color: '#f87171', textTransform: 'uppercase' }}>
                                    Impayé
                                  </span>
                                  <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 12, color: '#f87171' }}>
                                    {formatPrice(occ.unpaidAmount)}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div style={{ marginTop: 8, borderTop: '1px solid var(--line)', paddingTop: 6 }}>
                              <span style={{ fontFamily: 'Jost, sans-serif', fontSize: 9, color: 'var(--cream-dim)', letterSpacing: '0.08em' }}>
                                Durée : {sessionDuration(occ.createdAt)}
                              </span>
                            </div>
                          </>
                        ) : (
                          <div style={{ fontFamily: 'Jost, sans-serif', fontSize: 10, color: 'var(--cream-dim)', letterSpacing: '0.08em' }}>
                            Libre
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
