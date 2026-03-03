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
  const [loading, setLoading] = useState(false);
  const [qrUrl,   setQrUrl]   = useState<string | null>(table.qrCodeUrl);

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

  const downloadQR = () => {
    window.open(
      `${process.env.NEXT_PUBLIC_API_URL}/tables/${restaurantId}/${table.id}/qr/download`,
      '_blank',
    );
  };

  return (
    <div className={dk.card} style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center' }}>
      {/* Status + label */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ textAlign: 'left' }}>
          <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 13, fontWeight: 600, color: 'var(--cream)' }}>
            {table.label}
          </p>
          <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 10, color: 'var(--cream-dim)', marginTop: 2 }}>
            {table.capacity} pers.
          </p>
        </div>
        <span style={{
          fontFamily: 'Jost, sans-serif',
          fontSize: 9,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: STATUS_COLOR[table.status] ?? 'var(--cream-dim)',
        }}>
          {STATUS_LABEL[table.status] ?? table.status}
        </span>
      </div>

      {/* QR code */}
      {qrUrl ? (
        <>
          <Image
            src={qrUrl}
            alt={`QR ${table.label}`}
            width={130}
            height={130}
            unoptimized
            style={{ display: 'block' }}
          />
          <button
            onClick={downloadQR}
            className={dk.btnOutline}
            style={{ fontSize: 9, padding: '8px 16px', width: '100%' }}
          >
            Télécharger PNG
          </button>
        </>
      ) : (
        <button
          onClick={generateQR}
          disabled={loading}
          className={dk.btn}
          style={{ width: '100%', fontSize: 9, padding: '10px 16px' }}
        >
          {loading ? 'Génération…' : 'Générer QR'}
        </button>
      )}
    </div>
  );
}
