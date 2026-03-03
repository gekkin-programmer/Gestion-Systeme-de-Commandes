'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dk from '@/styles/dark.module.css';

interface ReceiptPageProps {
  params: { orderId: string };
}

export default function ReceiptPage({ params }: ReceiptPageProps) {
  const router  = useRouter();
  const [done, setDone] = useState(false);

  useEffect(() => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/receipts/${params.orderId}`;
    const t = setTimeout(() => setDone(true), 2000);
    return () => clearTimeout(t);
  }, [params.orderId]);

  return (
    <div
      className={dk.page}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        padding: 20,
        textAlign: 'center',
      }}
    >
      {done ? (
        <>
          <span className={dk.playfair} style={{ fontSize: 48, color: 'var(--gold)' }}>↓</span>
          <p className={dk.playfair} style={{ fontSize: 22, color: 'var(--cream)' }}>
            Reçu prêt
          </p>
          <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 12, color: 'var(--cream-dim)' }}>
            Le reçu devrait s'ouvrir automatiquement dans votre navigateur.
          </p>
          <button className={dk.btnOutline} onClick={() => router.back()} style={{ marginTop: 8 }}>
            ← Retour
          </button>
        </>
      ) : (
        <>
          <span
            style={{
              fontFamily: 'Jost, sans-serif',
              fontSize: 11,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--cream-dim)',
            }}
          >
            Préparation du reçu
          </span>
          <p className={dk.playfair} style={{ fontSize: 22, color: 'var(--cream)' }}>
            Téléchargement en cours…
          </p>
          <div
            style={{
              width: 40,
              height: 2,
              background: 'var(--gold)',
              animation: 'none',
              opacity: 0.8,
            }}
          />
        </>
      )}
    </div>
  );
}
