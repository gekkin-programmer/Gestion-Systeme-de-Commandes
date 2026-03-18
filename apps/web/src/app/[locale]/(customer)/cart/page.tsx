'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { CartItem } from '@/components/cart/CartItem';
import { PaymentMethodSelector } from '@/components/payment/PaymentMethodSelector';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';
import { useTheme } from '@/hooks/useTheme';
import api from '@/lib/api';
import dk from '@/styles/dark.module.css';
import { PAYMENT_METHOD, type PaymentMethod } from '@repo/shared';

export default function CartPage() {
  const locale = useLocale();
  const router = useRouter();
  const themeStyle = useTheme();

  const {
    items, sessionToken, notes, customerPhone,
    setNotes, setCustomerPhone, clearCart, getSubtotal,
    setPendingOrder, pendingOrder,
  } = useCartStore();

  const [method,   setMethod]  = useState<PaymentMethod>(PAYMENT_METHOD.CASH);
  const [loading,  setLoading] = useState(false);
  const [error,    setError]   = useState('');
  const [queued,   setQueued]  = useState(false);
  const [mounted,  setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Prevent hydration mismatch: Zustand persist rehydrates localStorage
  // synchronously on the client, so items/totals differ from server render.
  // Both server and client render null until after mount.
  if (!mounted) return null;

  const total = getSubtotal();

  const isMobileMoney =
    method === PAYMENT_METHOD.MTN_MOBILE_MONEY ||
    method === PAYMENT_METHOD.ORANGE_MONEY;

  const queueOrder = () => {
    if (!sessionToken) return;
    // Prevent double-queue
    if (pendingOrder) return;
    setPendingOrder({
      items,
      sessionToken,
      notes,
      customerPhone,
      paymentMethod: method,
      isMobileMoney,
      queuedAt: new Date().toISOString(),
    });
    setQueued(true);
  };

  const placeOrder = async () => {
    if (!sessionToken) {
      setError('Session expirée. Retournez au menu et scannez à nouveau le QR code.');
      return;
    }
    if (isMobileMoney && !customerPhone.trim()) {
      setError('Veuillez saisir votre numéro de téléphone pour le paiement Mobile Money.');
      return;
    }

    // Offline before even trying → queue immediately
    if (!navigator.onLine) {
      queueOrder();
      return;
    }

    setLoading(true);
    setError('');
    try {
      /* 1 — Place the order (notes flow to the kitchen automatically) */
      const { data } = await api.post('/orders', {
        sessionToken,
        items:         items.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity })),
        notes:         notes.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined,
      });
      const orderId: string = data.data.id;

      /* 2 — Initiate payment */
      await api.post('/payments/initiate', {
        orderId,
        method,
        mobileMoneyPhone: isMobileMoney ? customerPhone.trim() : undefined,
      });

      /* 3 — Auto-confirm mobile money (mock) */
      if (isMobileMoney) {
        await api.post(`/payments/callback/mock/${orderId}?simulate=success`);
      }

      clearCart();
      router.push(`/${locale}/order/${orderId}`);
    } catch (err: any) {
      // Only queue when the device is genuinely offline
      if (!navigator.onLine) {
        queueOrder();
        return;
      }
      setError(err?.response?.data?.error ?? 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  /* ── Empty cart ── */
  if (items.length === 0) {
    return (
      <div
        className={dk.page}
        style={{ ...themeStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 20 }}
      >
        <span className={dk.sectionLabel}>Votre panier</span>
        <p className={dk.playfair} style={{ fontSize: 20, color: 'var(--cream-dim)' }}>
          Votre panier est vide
        </p>
        <button className={dk.btnOutline} onClick={() => router.back()}>
          ← Retour au menu
        </button>
      </div>
    );
  }

  /* ── Full cart ── */
  return (
    <div className={dk.page} style={themeStyle}>

      {/* Sticky header */}
      <header className={dk.header}>
        <button className={dk.backBtn} onClick={() => router.back()}>
          ← Menu
        </button>
        <span className={dk.headerTitle}>Mon panier</span>
        <div className={dk.headerRight}>
          <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 14, color: 'var(--gold)' }}>
            {items.length} article{items.length > 1 ? 's' : ''}
          </span>
        </div>
      </header>

      <main className={dk.main}>

        {/* Cart items */}
        <div className={dk.card} style={{ padding: '0 20px' }}>
          {items.map((item) => (
            <CartItem key={item.menuItemId} item={item} />
          ))}
        </div>

        {/* Instructions spéciales — transmitted to kitchen */}
        <div className={dk.card}>
          <span className={dk.sectionLabel}>Instructions spéciales</span>
          <div className={dk.inputGroup} style={{ marginBottom: 0 }}>
            <label className={dk.inputLabel} htmlFor="notes">
              Transmises au restaurant avec la commande
            </label>
            <textarea
              id="notes"
              className={dk.input}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex : sans piment, allergie aux noix, cuisson bien cuite…"
              rows={2}
              style={{ resize: 'vertical', fontFamily: 'Jost, sans-serif' }}
            />
          </div>
        </div>

        {/* Phone number */}
        <div className={dk.card}>
          <span className={dk.sectionLabel}>Coordonnées</span>
          <div className={dk.inputGroup} style={{ marginBottom: 0 }}>
            <label className={dk.inputLabel} htmlFor="phone">
              Numéro de téléphone{isMobileMoney ? ' *' : ' (optionnel)'}
            </label>
            <input
              id="phone"
              type="tel"
              className={dk.input}
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="+237 6XX XXX XXX"
            />
          </div>
        </div>

        {/* Payment method */}
        <div className={dk.card}>
          <span className={dk.sectionLabel}>Mode de paiement</span>
          <PaymentMethodSelector value={method} onChange={setMethod} />
        </div>

        {/* Total */}
        <div className={dk.card} style={{ marginBottom: 0 }}>
          <div className={dk.row} style={{ borderBottom: 'none', paddingBottom: 0 }}>
            <span className={dk.rowLabel} style={{ fontSize: 13, color: 'var(--cream)' }}>Total</span>
            <span className={dk.rowTotal}>{formatPrice(total)}</span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className={dk.errorBox} style={{ marginTop: 12 }}>
            <span className={dk.errorText}>{error}</span>
          </div>
        )}

        {/* Queued offline notice */}
        {queued && (
          <div
            style={{
              marginTop: 12,
              background: 'rgba(212,160,74,0.12)',
              border: '1px solid rgba(212,160,74,0.35)',
              padding: '12px 16px',
              fontFamily: 'Jost, sans-serif',
              fontSize: 13,
              color: 'var(--cream)',
              lineHeight: 1.5,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1, color: 'var(--gold)' }}>
              <line x1="1" y1="1" x2="23" y2="23" />
              <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
              <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
              <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
              <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
              <line x1="12" y1="20" x2="12.01" y2="20" />
            </svg>
            <span>
              <strong style={{ color: 'var(--gold)' }}>Commande enregistrée.</strong><br />
              Elle sera envoyée automatiquement dès le retour du réseau.
            </span>
          </div>
        )}
      </main>

      {/* Fixed bottom bar */}
      <div className={dk.fixedBar}>
        <div className={dk.fixedBarInfo}>
          <span className={dk.fixedBarLabel}>
            {method === PAYMENT_METHOD.CASH ? 'Payer à la réception' : 'Payer maintenant'}
          </span>
          <span className={dk.fixedBarPrice}>{formatPrice(total)}</span>
        </div>
        <button
          className={dk.fixedBarBtn}
          disabled={loading || queued}
          onClick={placeOrder}
        >
          {loading ? 'Envoi…' : queued ? 'En attente…' : 'Commander'}
        </button>
      </div>
    </div>
  );
}
