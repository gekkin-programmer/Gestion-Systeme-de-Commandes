'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import type { TableDTO } from '@/types';

export default function PrintQRPage() {
  const { user } = useAuth();
  const restaurantId = user?.restaurantId ?? '';

  const [tables,  setTables]  = useState<TableDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [status,  setStatus]  = useState('Chargement des tables…');

  useEffect(() => {
    if (!restaurantId) return;

    const run = async () => {
      /* 1 — load tables */
      const { data } = await api.get(`/tables/${restaurantId}`);
      let rows: TableDTO[] = data.data;
      setStatus('Génération des QR codes manquants…');

      /* 2 — generate QR for any table that doesn't have one yet */
      const missing = rows.filter((t) => !t.qrCodeUrl);
      if (missing.length > 0) {
        const generated = await Promise.all(
          missing.map(async (t) => {
            const res = await api.post(`/tables/${restaurantId}/${t.id}/qr`);
            return { ...t, qrCodeUrl: res.data.data.qrCodeUrl as string };
          }),
        );
        const map = Object.fromEntries(generated.map((t) => [t.id, t]));
        rows = rows.map((t) => map[t.id] ?? t);
      }

      setTables(rows);
      setLoading(false);
      setStatus('');
    };

    run().catch((e) => {
      setStatus(`Erreur : ${e.message}`);
      setLoading(false);
    });
  }, [restaurantId]);

  /* ── Loading screen (hidden when printing) ── */
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'Jost, sans-serif', gap: 12 }}>
        <p style={{ color: '#666', fontSize: 14 }}>{status}</p>
      </div>
    );
  }

  return (
    <>
      {/* ── Screen-only controls ── */}
      <div className="no-print" style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        background: '#fff',
        borderBottom: '1px solid #e5e7eb',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
      }}>
        <div>
          <p style={{ fontWeight: 700, fontSize: 16, color: '#111', fontFamily: 'Playfair Display, serif' }}>
            QR Codes — Impression
          </p>
          <p style={{ fontSize: 12, color: '#6b7280', fontFamily: 'Jost, sans-serif' }}>
            {tables.length} table{tables.length > 1 ? 's' : ''} · Scannez pour tester le parcours client
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => window.history.back()}
            style={{
              padding: '8px 16px',
              border: '1px solid #d1d5db',
              borderRadius: 8,
              background: 'none',
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: 'Jost, sans-serif',
            }}
          >
            ← Retour
          </button>
          <button
            onClick={() => window.print()}
            style={{
              padding: '8px 20px',
              background: '#C8A96E',
              border: 'none',
              borderRadius: 8,
              color: '#100C07',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: 'Jost, sans-serif',
              letterSpacing: '0.05em',
            }}
          >
            Imprimer
          </button>
        </div>
      </div>

      {/* ── Print grid ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 24,
        padding: 32,
        background: '#fff',
        maxWidth: 900,
        margin: '0 auto',
      }}>
        {tables.map((table) => (
          <div
            key={table.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              border: '1px solid #e5e7eb',
              borderRadius: 12,
              padding: '20px 16px 16px',
              gap: 10,
              pageBreakInside: 'avoid',
              background: '#fff',
            }}
          >
            {/* Restaurant name */}
            <p style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: 13,
              fontWeight: 700,
              color: '#1a1a1a',
              letterSpacing: '0.02em',
              textAlign: 'center',
            }}>
              Restaurant Le Baobab
            </p>

            {/* QR code */}
            {table.qrCodeUrl ? (
              <Image
                src={table.qrCodeUrl}
                alt={`QR ${table.label}`}
                width={160}
                height={160}
                style={{ display: 'block' }}
                unoptimized
              />
            ) : (
              <div style={{ width: 160, height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', borderRadius: 8 }}>
                <span style={{ fontSize: 11, color: '#9ca3af' }}>QR manquant</span>
              </div>
            )}

            {/* Table label */}
            <p style={{
              fontFamily: 'Jost, sans-serif',
              fontWeight: 700,
              fontSize: 15,
              color: '#1a1a1a',
              textAlign: 'center',
            }}>
              {table.label}
            </p>

            {/* Instruction */}
            <p style={{
              fontFamily: 'Jost, sans-serif',
              fontSize: 10,
              color: '#6b7280',
              textAlign: 'center',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}>
              Scannez pour commander
            </p>
          </div>
        ))}
      </div>

      {/* Print CSS */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; }
          @page { margin: 16mm; }
        }
      `}</style>
    </>
  );
}
