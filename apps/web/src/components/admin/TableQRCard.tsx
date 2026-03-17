'use client';

import Image from 'next/image';
import { useState } from 'react';
import api from '@/lib/api';
import dk from '@/styles/dark.module.css';
import type { TableDTO } from '@/types';

interface TableQRCardProps {
  table: TableDTO;
  restaurantId: string;
  onUpdated?: (table: TableDTO) => void;
}

const STATUS_LABEL: Record<string, string> = {
  AVAILABLE: 'Libre',
  OCCUPIED:  'Occupée',
  RESERVED:  'Réservée',
};
const STATUS_COLOR: Record<string, string> = {
  AVAILABLE: '#6fcf6f',
  OCCUPIED:  'var(--gold)',
  RESERVED:  'var(--cream-dim)',
};

export function TableQRCard({ table, restaurantId, onUpdated }: TableQRCardProps) {
  const [loading,  setLoading]  = useState(false);
  const [qrUrl,    setQrUrl]    = useState<string | null>(table.qrCodeUrl);
  const [editing,  setEditing]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [form,     setForm]     = useState({ label: table.label, capacity: String(table.capacity) });

  const generateQR = async () => {
    setLoading(true);
    try {
      const { data } = await api.post(`/tables/${restaurantId}/${table.id}/qr`);
      setQrUrl(data.data.qrCodeUrl);
      onUpdated?.({ ...table, qrCodeUrl: data.data.qrCodeUrl });
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = async () => {
    if (!qrUrl) return;
    const a = document.createElement('a');
    a.href = qrUrl;
    a.download = `qr-${table.label.replace(/\s+/g, '-')}.png`;
    a.click();
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.patch(`/tables/${restaurantId}/${table.id}`, {
        label:    form.label,
        capacity: parseInt(form.capacity),
      });
      onUpdated?.(data.data);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={dk.card} style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Header: label + status + edit toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 13, fontWeight: 600, color: 'var(--cream)' }}>
            {table.label}
          </p>
          <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 10, color: 'var(--cream-dim)', marginTop: 2 }}>
            {table.capacity} pers.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <span style={{ fontFamily: 'Jost, sans-serif', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: STATUS_COLOR[table.status] ?? 'var(--cream-dim)' }}>
            {STATUS_LABEL[table.status] ?? table.status}
          </span>
          <button
            onClick={() => setEditing((v) => !v)}
            style={{ background: 'none', border: 'none', color: 'var(--cream-dim)', cursor: 'pointer', fontFamily: 'Jost, sans-serif', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', padding: 0 }}
          >
            {editing ? 'Annuler' : '✎ Modifier'}
          </button>
        </div>
      </div>

      {/* Edit form */}
      {editing && (
        <form onSubmit={saveEdit} style={{ display: 'flex', flexDirection: 'column', gap: 8, borderTop: '1px solid var(--line)', paddingTop: 10 }}>
          <div className={dk.inputGroup} style={{ marginBottom: 0 }}>
            <label className={dk.inputLabel}>Label</label>
            <input
              className={dk.input}
              value={form.label}
              onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
              required
            />
          </div>
          <div className={dk.inputGroup} style={{ marginBottom: 0 }}>
            <label className={dk.inputLabel}>Capacité</label>
            <input
              type="number"
              className={dk.input}
              value={form.capacity}
              min={1}
              onChange={(e) => setForm((p) => ({ ...p, capacity: e.target.value }))}
            />
          </div>
          <button type="submit" className={dk.btn} disabled={saving} style={{ fontSize: 9, padding: '8px 16px' }}>
            {saving ? 'Sauvegarde…' : 'Sauvegarder'}
          </button>
        </form>
      )}

      {/* QR code */}
      {!editing && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          {qrUrl ? (
            <>
              <Image src={qrUrl} alt={`QR ${table.label}`} width={130} height={130} unoptimized style={{ display: 'block' }} />
              <button onClick={downloadQR} className={dk.btnOutline} style={{ fontSize: 9, padding: '8px 16px', width: '100%' }}>
                Télécharger PNG
              </button>
              <button onClick={generateQR} disabled={loading} className={dk.btnOutline} style={{ fontSize: 9, padding: '8px 16px', width: '100%', opacity: 0.6 }}>
                {loading ? 'Regénération…' : '↺ Regénérer QR'}
              </button>
            </>
          ) : (
            <button onClick={generateQR} disabled={loading} className={dk.btn} style={{ width: '100%', fontSize: 9, padding: '10px 16px' }}>
              {loading ? 'Génération…' : 'Générer QR'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
