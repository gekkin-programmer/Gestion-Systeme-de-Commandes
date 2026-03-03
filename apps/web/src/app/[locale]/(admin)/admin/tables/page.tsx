'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { TableQRCard } from '@/components/admin/TableQRCard';
import { BackButton } from '@/components/shared/BackButton';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import dk from '@/styles/dark.module.css';
import type { TableDTO } from '@/types';

export default function TablesAdminPage() {
  const locale = useLocale();
  const { user } = useAuth();
  const restaurantId = user?.restaurantId ?? '';

  const [tables,   setTables]   = useState<TableDTO[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ number: '', label: '', capacity: '4' });

  useEffect(() => {
    if (!restaurantId) return;
    api.get(`/tables/${restaurantId}`)
      .then(({ data }) => setTables(data.data))
      .finally(() => setLoading(false));
  }, [restaurantId]);

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

  return (
    <div className={dk.page}>

      {/* Header */}
      <header className={dk.header}>
        <BackButton />
        <span className={dk.headerTitle}>Tables</span>
        <div className={dk.headerRight} style={{ gap: 8 }}>
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
        </div>
      </header>

      <main className={dk.main}>

        {/* Create form */}
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

        {/* Tables grid */}
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
      </main>
    </div>
  );
}
