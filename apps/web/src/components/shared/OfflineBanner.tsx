'use client';

import { useOnline } from '@/hooks/useOnline';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { useCartStore } from '@/store/cartStore';

/**
 * Global banner shown at the top of every page when the device is offline
 * or when a queued order is pending / being retried.
 *
 * Also mounts `useOfflineSync` so the retry logic runs app-wide without
 * needing an extra provider component.
 */
export function OfflineBanner() {
  // Mount the sync hook here so it's always active
  useOfflineSync();

  const isOnline      = useOnline();
  const pendingOrder  = useCartStore((s) => s.pendingOrder);
  const isSyncing     = useCartStore((s) => s.isSyncing);

  // Nothing to show
  if (isOnline && !pendingOrder && !isSyncing) return null;

  let message: string;
  let bg: string;

  if (isSyncing) {
    message = '⏳ Envoi de votre commande…';
    bg      = '#C8A96E';
  } else if (pendingOrder && !isOnline) {
    message = '📴 Commande en attente — sera envoyée dès le retour du réseau';
    bg      = '#d4a04a';
  } else if (pendingOrder && isOnline) {
    // Online came back but handleOnline hasn't fired yet (race) — reassure user
    message = '⏳ Envoi de votre commande…';
    bg      = '#C8A96E';
  } else {
    // Simple offline, no pending order
    message = '⚠️ Pas de connexion internet';
    bg      = '#888';
  }

  return (
    <div
      style={{
        position:   'fixed',
        top:        0,
        left:       0,
        right:      0,
        zIndex:     100,
        background: bg,
        padding:    '8px 16px',
        textAlign:  'center',
        fontSize:   13,
        fontFamily: 'Jost, sans-serif',
        color:      '#fff',
        fontWeight: 500,
      }}
    >
      {message}
    </div>
  );
}
