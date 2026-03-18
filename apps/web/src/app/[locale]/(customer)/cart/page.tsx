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

const t = {
  fr: {
    yourCart:        'Votre panier',
    myCart:          'Mon panier',
    empty:           'Votre panier est vide',
    backToMenu:      '← Retour au menu',
    back:            '← Menu',
    article:         'article',
    articles:        'articles',
    specialInstr:    'Instructions spéciales',
    instrLabel:      'Transmises au restaurant avec la commande',
    instrPlaceholder:'Ex : sans piment, allergie aux noix, cuisson bien cuite…',
    contact:         'Coordonnées',
    phone:           'Numéro de téléphone',
    phoneOpt:        ' (optionnel)',
    phoneReq:        ' *',
    phonePlaceholder:'+237 6XX XXX XXX',
    payment:         'Mode de paiement',
    total:           'Total',
    payCash:         'Payer à la réception',
    payNow:          'Payer maintenant',
    send:            'Envoi…',
    waiting:         'En attente…',
    order:           'Commander',
    sessionExpired:  'Session expirée. Retournez au menu et scannez à nouveau le QR code.',
    phoneRequired:   'Veuillez saisir votre numéro de téléphone pour le paiement Mobile Money.',
    genericError:    'Une erreur est survenue. Veuillez réessayer.',
    staleCart:       'Panier expiré. Retournez au menu pour ajouter vos articles.',
    orderConfirmed:  'Commande confirmée !',
    redirecting:     'Redirection en cours…',
    queuedTitle:     'Commande enregistrée.',
    queuedBody:      'Elle sera envoyée automatiquement dès le retour du réseau.',
  },
  en: {
    yourCart:        'Your cart',
    myCart:          'My cart',
    empty:           'Your cart is empty',
    backToMenu:      '← Back to menu',
    back:            '← Menu',
    article:         'item',
    articles:        'items',
    specialInstr:    'Special instructions',
    instrLabel:      'Sent to the restaurant with your order',
    instrPlaceholder:'E.g. no spice, nut allergy, well done…',
    contact:         'Contact',
    phone:           'Phone number',
    phoneOpt:        ' (optional)',
    phoneReq:        ' *',
    phonePlaceholder:'+237 6XX XXX XXX',
    payment:         'Payment method',
    total:           'Total',
    payCash:         'Pay at the counter',
    payNow:          'Pay now',
    send:            'Sending…',
    waiting:         'Pending…',
    order:           'Place order',
    sessionExpired:  'Session expired. Go back to the menu and scan the QR code again.',
    phoneRequired:   'Please enter your phone number for Mobile Money payment.',
    genericError:    'An error occurred. Please try again.',
    staleCart:       'Cart expired. Go back to the menu to add your items.',
    orderConfirmed:  'Order placed!',
    redirecting:     'Redirecting…',
    queuedTitle:     'Order saved.',
    queuedBody:      'It will be sent automatically when your connection is restored.',
  },
} as const;

export default function CartPage() {
  const locale = useLocale();
  const router = useRouter();
  const themeStyle = useTheme();

  const {
    items, sessionToken, notes, customerPhone, lang,
    setNotes, setCustomerPhone, clearCart, getSubtotal,
    setPendingOrder, pendingOrder,
  } = useCartStore();

  const tx = t[lang ?? 'fr'];

  const [method,        setMethod]       = useState<PaymentMethod>(PAYMENT_METHOD.CASH);
  const [loading,       setLoading]      = useState(false);
  const [error,         setError]        = useState('');
  const [queued,        setQueued]       = useState(false);
  const [mounted,       setMounted]      = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);

  useEffect(() => { setMounted(true); }, []);

  // Navigate to order tracking page after successful order (replaces history so back skips cart)
  useEffect(() => {
    if (placedOrderId) {
      router.replace(`/${locale}/order/${placedOrderId}`);
    }
  }, [placedOrderId, locale, router]);

  if (!mounted) return null;

  // Order was just placed — show confirmation screen while router.replace fires
  if (placedOrderId) {
    return (
      <div
        className={dk.page}
        style={{ ...themeStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}
      >
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        <span className={dk.playfair} style={{ fontSize: 22, color: 'var(--gold)' }}>{tx.orderConfirmed}</span>
        <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 14, color: 'var(--cream-dim)' }}>{tx.redirecting}</p>
      </div>
    );
  }

  const total = getSubtotal();

  const isMobileMoney =
    method === PAYMENT_METHOD.MTN_MOBILE_MONEY ||
    method === PAYMENT_METHOD.ORANGE_MONEY;

  const queueOrder = () => {
    if (!sessionToken) return;
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
      setError(tx.sessionExpired);
      return;
    }
    if (isMobileMoney && !customerPhone.trim()) {
      setError(tx.phoneRequired);
      return;
    }

    // Detect stale items left over from a previous session (non-UUID IDs)
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const hasStaleItems = items.some((i) => !UUID_RE.test(i.menuItemId));
    if (hasStaleItems) {
      clearCart();
      setError(tx.staleCart);
      return;
    }

    if (!navigator.onLine) {
      queueOrder();
      return;
    }

    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/orders', {
        sessionToken,
        items:         items.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity })),
        notes:         notes.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined,
      });
      const orderId: string = data.data.id;

      await api.post('/payments/initiate', {
        orderId,
        method,
        mobileMoneyPhone: isMobileMoney ? customerPhone.trim() : undefined,
      });

      if (isMobileMoney) {
        await api.post(`/payments/callback/mock/${orderId}?simulate=success`);
      }

      clearCart();
      setPlacedOrderId(orderId);
    } catch (err: any) {
      if (!navigator.onLine) {
        queueOrder();
        return;
      }
      setError(err?.response?.data?.error ?? tx.genericError);
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
        <span className={dk.sectionLabel}>{tx.yourCart}</span>
        <p className={dk.playfair} style={{ fontSize: 20, color: 'var(--cream-dim)' }}>
          {tx.empty}
        </p>
        <button className={dk.btnOutline} onClick={() => router.back()}>
          {tx.backToMenu}
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
          {tx.back}
        </button>
        <span className={dk.headerTitle}>{tx.myCart}</span>
        <div className={dk.headerRight}>
          <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 14, color: 'var(--gold)' }}>
            {items.length} {items.length > 1 ? tx.articles : tx.article}
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

        {/* Special instructions */}
        <div className={dk.card}>
          <span className={dk.sectionLabel}>{tx.specialInstr}</span>
          <div className={dk.inputGroup} style={{ marginBottom: 0 }}>
            <label className={dk.inputLabel} htmlFor="notes">
              {tx.instrLabel}
            </label>
            <textarea
              id="notes"
              className={dk.input}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={tx.instrPlaceholder}
              rows={2}
              style={{ resize: 'vertical', fontFamily: 'Jost, sans-serif' }}
            />
          </div>
        </div>

        {/* Phone number */}
        <div className={dk.card}>
          <span className={dk.sectionLabel}>{tx.contact}</span>
          <div className={dk.inputGroup} style={{ marginBottom: 0 }}>
            <label className={dk.inputLabel} htmlFor="phone">
              {tx.phone}{isMobileMoney ? tx.phoneReq : tx.phoneOpt}
            </label>
            <input
              id="phone"
              type="tel"
              className={dk.input}
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder={tx.phonePlaceholder}
            />
          </div>
        </div>

        {/* Payment method */}
        <div className={dk.card}>
          <span className={dk.sectionLabel}>{tx.payment}</span>
          <PaymentMethodSelector value={method} onChange={setMethod} />
        </div>

        {/* Total */}
        <div className={dk.card} style={{ marginBottom: 0 }}>
          <div className={dk.row} style={{ borderBottom: 'none', paddingBottom: 0 }}>
            <span className={dk.rowLabel} style={{ fontSize: 13, color: 'var(--cream)' }}>{tx.total}</span>
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
              <strong style={{ color: 'var(--gold)' }}>{tx.queuedTitle}</strong><br />
              {tx.queuedBody}
            </span>
          </div>
        )}
      </main>

      {/* Fixed bottom bar */}
      <div className={dk.fixedBar}>
        <div className={dk.fixedBarInfo}>
          <span className={dk.fixedBarLabel}>
            {method === PAYMENT_METHOD.CASH ? tx.payCash : tx.payNow}
          </span>
          <span className={dk.fixedBarPrice}>{formatPrice(total)}</span>
        </div>
        <button
          className={dk.fixedBarBtn}
          disabled={loading || queued}
          onClick={placeOrder}
        >
          {loading ? tx.send : queued ? tx.waiting : tx.order}
        </button>
      </div>
    </div>
  );
}
