'use client';

import { useState, useEffect } from 'react';
import { useOnline } from '@/hooks/useOnline';

export function OfflineBanner() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const isOnline = useOnline();

  if (!mounted || isOnline) return null;

  return (
    <div
      style={{
        position:   'fixed',
        top:        0,
        left:       0,
        right:      0,
        zIndex:     100,
        background: '#888',
        padding:    '8px 16px',
        textAlign:  'center',
        fontSize:   13,
        fontFamily: 'Jost, sans-serif',
        color:      '#fff',
        fontWeight: 500,
      }}
    >
      ⚠️ Pas de connexion internet
    </div>
  );
}
