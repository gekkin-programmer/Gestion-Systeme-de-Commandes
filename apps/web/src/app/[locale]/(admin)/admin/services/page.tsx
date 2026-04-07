'use client';

import { useEffect, useState, useCallback } from 'react';
import { BackButton } from '@/components/shared/BackButton';
import { formatPrice } from '@/lib/utils';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import dk from '@/styles/dark.module.css';
import type { ServiceItemDTO } from '@/types';

const DEPARTMENTS = [
  { value: 'ROOM_SERVICE', label: 'Room Service', color: '#f59e0b' },
  { value: 'HOUSEKEEPING', label: 'Ménage',       color: '#3b82f6' },
  { value: 'CONCIERGE',    label: 'Conciergerie', color: '#8b5cf6' },
  { value: 'SPA',          label: 'Spa',          color: '#ec4899' },
];

interface ItemForm {
  nameFr: string;
  nameEn: string;
  descriptionFr: string;
  price: string;
}

const EMPTY_FORM: ItemForm = { nameFr: '', nameEn: '', descriptionFr: '', price: '' };

export default function AdminServicesPage() {
  const { user } = useAuth();
  const hotelId = (user as any)?.hotelId ?? '';

  const [activeDept, setActiveDept] = useState(DEPARTMENTS[0].value);
  const [items,     setItems]     = useState<Record<string, ServiceItemDTO[]>>({});
  const [loading,   setLoading]   = useState<Record<string, boolean>>({});
  const [showForm,  setShowForm]  = useState(false);
  const [form,      setForm]      = useState<ItemForm>(EMPTY_FORM);
  const [creating,  setCreating]  = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const loadDept = useCallback((dept: string) => {
    if (!hotelId || items[dept]) return;
    setLoading((p) => ({ ...p, [dept]: true }));
    api.get(`/services/hotel/${hotelId}/dept/${dept}`)
      .then(({ data }) => {
        const deptData = data.data;
        setItems((p) => ({ ...p, [dept]: deptData.items ?? [] }));
      })
      .finally(() => setLoading((p) => ({ ...p, [dept]: false })));
  }, [hotelId, items]);

  useEffect(() => { if (hotelId) loadDept(activeDept); }, [activeDept, hotelId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
    try {
      const { data } = await api.post(`/services/hotel/${hotelId}`, {
        department:    activeDept,
        nameFr:        form.nameFr,
        nameEn:        form.nameEn || form.nameFr,
        descriptionFr: form.descriptionFr || null,
        price:         form.price ? parseFloat(form.price) : null,
      });
      setItems((p) => ({ ...p, [activeDept]: [...(p[activeDept] ?? []), data.data] }));
      setForm(EMPTY_FORM);
      setShowForm(false);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Erreur lors de la création.';
      setCreateError(msg);
    } finally {
      setCreating(false);
    }
  };

  const handleToggleAvailability = async (item: ServiceItemDTO) => {
    setTogglingId(item.id);
    try {
      await api.patch(`/services/${item.id}/availability`);
      setItems((p) => ({
        ...p,
        [activeDept]: (p[activeDept] ?? []).map((i) =>
          i.id === item.id ? { ...i, isAvailable: !i.isAvailable } : i,
        ),
      }));
    } catch { /* silent */ } finally {
      setTogglingId(null);
    }
  };

  const deptInfo = DEPARTMENTS.find((d) => d.value === activeDept)!;
  const deptItems = items[activeDept] ?? [];
  const isLoading = loading[activeDept];

  return (
    <div className={dk.page}>

      <header className={dk.header}>
        <BackButton />
        <span className={dk.headerTitle}>Services</span>
        <div className={dk.headerRight}>
          <button className={dk.btn} style={{ fontSize: 9, padding: '8px 14px' }} onClick={() => { setShowForm((v) => !v); setCreateError(null); }}>
            + Article
          </button>
        </div>
      </header>

      <main className={dk.main}>

        {/* Dept tab bar */}
        <div className={dk.tabBar}>
          {DEPARTMENTS.map((d) => (
            <button
              key={d.value}
              className={`${dk.tab} ${activeDept === d.value ? dk.tabActive : ''}`}
              style={activeDept === d.value ? { color: d.color, borderBottomColor: d.color } : {}}
              onClick={() => { setActiveDept(d.value); setShowForm(false); }}
            >
              {d.label}
            </button>
          ))}
        </div>

        {/* Create form */}
        {showForm && (
          <div className={dk.card} style={{ borderTop: `2px solid ${deptInfo.color}` }}>
            <span className={dk.sectionLabel}>Nouvel article — {deptInfo.label}</span>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              <div className={dk.inputGroup}>
                <label className={dk.inputLabel}>Nom (FR)</label>
                <input type="text" className={dk.input} value={form.nameFr} onChange={(e) => setForm((p) => ({ ...p, nameFr: e.target.value }))} placeholder="Nom en français" required />
              </div>
              <div className={dk.inputGroup}>
                <label className={dk.inputLabel}>Nom (EN)</label>
                <input type="text" className={dk.input} value={form.nameEn} onChange={(e) => setForm((p) => ({ ...p, nameEn: e.target.value }))} placeholder="Name in English" />
              </div>
              <div className={dk.inputGroup}>
                <label className={dk.inputLabel}>Description (FR)</label>
                <input type="text" className={dk.input} value={form.descriptionFr} onChange={(e) => setForm((p) => ({ ...p, descriptionFr: e.target.value }))} placeholder="Description courte" />
              </div>
              <div className={dk.inputGroup}>
                <label className={dk.inputLabel}>Prix (XAF) — laisser vide si gratuit</label>
                <input type="number" className={dk.input} value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} placeholder="0" min="0" step="100" />
              </div>
              {createError && (
                <div className={dk.errorBox} style={{ marginBottom: 12 }}>
                  <span className={dk.errorText}>{createError}</span>
                </div>
              )}
              <button type="submit" className={dk.btn} disabled={creating} style={{ width: '100%' }}>
                {creating ? 'Création…' : 'Ajouter l\'article'}
              </button>
            </form>
          </div>
        )}

        {/* Items list */}
        {isLoading ? (
          <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 12, color: 'var(--cream-dim)', textAlign: 'center', padding: '40px 0' }}>Chargement…</p>
        ) : deptItems.length === 0 ? (
          <div className={dk.card} style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 13, color: 'var(--cream-dim)' }}>Aucun article pour {deptInfo.label}.</p>
          </div>
        ) : (
          <div className={dk.card} style={{ padding: 0, overflow: 'hidden' }}>
            {deptItems.map((item) => {
              const isToggling = togglingId === item.id;
              return (
                <div
                  key={item.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
                    borderBottom: '1px solid var(--line)',
                    opacity: item.isAvailable ? 1 : 0.55,
                  }}
                >
                  {/* Availability dot */}
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.isAvailable ? deptInfo.color : 'var(--cream-dim)', flexShrink: 0 }} />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 13, color: 'var(--cream)', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.nameFr}
                    </p>
                    {item.descriptionFr && (
                      <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 10, color: 'var(--cream-dim)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.descriptionFr}
                      </p>
                    )}
                  </div>

                  <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 14, color: 'var(--gold)', flexShrink: 0 }}>
                    {item.price != null ? formatPrice(item.price) : 'Gratuit'}
                  </span>

                  <button
                    style={{ background: 'none', border: '1px solid var(--line)', color: 'var(--cream-dim)', padding: '4px 10px', cursor: 'pointer', fontFamily: 'Jost, sans-serif', fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', flexShrink: 0, opacity: isToggling ? 0.5 : 1 }}
                    disabled={isToggling}
                    onClick={() => handleToggleAvailability(item)}
                  >
                    {item.isAvailable ? 'Désactiver' : 'Activer'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
