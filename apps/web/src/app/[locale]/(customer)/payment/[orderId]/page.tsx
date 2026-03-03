'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { PaymentMethodSelector } from '@/components/payment/PaymentMethodSelector';
import { formatPrice } from '@/lib/utils';
import api from '@/lib/api';
import dk from '@/styles/dark.module.css';
import type { OrderDTO, RestaurantSettingsDTO } from '@/types';
import { PAYMENT_METHOD, type PaymentMethod } from '@repo/shared';

interface PaymentPageProps {
  params: { orderId: string; locale: string };
}

export default function PaymentPage({ params }: PaymentPageProps) {
  const locale = useLocale();
  const router = useRouter();

  const [order,       setOrder]       = useState<OrderDTO | null>(null);
  const [settings,    setSettings]    = useState<RestaurantSettingsDTO | null>(null);
  const [method,      setMethod]      = useState<PaymentMethod>(PAYMENT_METHOD.CASH);
  const [phone,       setPhone]       = useState('');
  const [loading,     setLoading]     = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [status,      setStatus]      = useState<'idle' | 'success' | 'failed'>('idle');

  useEffect(() => {
    api.get(`/orders/${params.orderId}/status`)
      .then(({ data }) => {
        const o: OrderDTO = data.data;
        setOrder(o);
        return api.get(`/restaurants/${o.restaurantId}`);
      })
      .then(({ data }) => setSettings(data.data.settings))
      .finally(() => setInitLoading(false));
  }, [params.orderId]);

  const handlePay = async () => {
    if (!order) return;
    setLoading(true);
    try {
      await api.post('/payments/initiate', {
        orderId: order.id,
        method,
        mobileMoneyPhone: phone || undefined,
      });

      if (method !== PAYMENT_METHOD.CASH) {
        await api.post(`/payments/callback/mock/${order.id}?simulate=success`);
      }
      setStatus('success');
      setTimeout(() => router.push(`/${locale}/order/${order.id}/receipt`), 2500);
    } catch {
      setStatus('failed');
    } finally {
      setLoading(false);
    }
  };

  /* ── Loading ── */
  if (initLoading) {
    return (
      <div
        className={dk.page}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <span className={dk.playfair} style={{ fontSize: 18, color: 'var(--cream-dim)' }}>
          Chargement…
        </span>
      </div>
    );
  }
  if (!order) return null;

  const needsPhone =
    method === PAYMENT_METHOD.MTN_MOBILE_MONEY ||
    method === PAYMENT_METHOD.ORANGE_MONEY;

  return (
    <div className={dk.page}>

      {/* Header */}
      <header className={dk.header}>
        <button className={dk.backBtn} onClick={() => router.back()}>
          ← Retour
        </button>
        <span className={dk.headerTitle}>Paiement</span>
        <div className={dk.headerRight}>
          <span className={dk.orderNum}>{order.orderNumber}</span>
        </div>
      </header>

      <main className={dk.main}>

        {/* Amount card */}
        <div className={dk.card} style={{ textAlign: 'center', padding: '24px 20px' }}>
          <span className={dk.sectionLabel}>Montant total</span>
          <span className={dk.goldPrice} style={{ fontSize: 32 }}>
            {formatPrice(order.totalAmount)}
          </span>
        </div>

        {/* Success state */}
        {status === 'success' && (
          <div className={dk.successBox}>
            <span className={dk.playfair} style={{ fontSize: 28, color: 'var(--gold)' }}>Merci !</span>
            <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 13, color: 'var(--cream-dim)' }}>
              Paiement reçu. Redirection vers le reçu…
            </p>
          </div>
        )}

        {/* Failed state */}
        {status === 'failed' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className={dk.errorBox}>
              <span className={dk.errorText}>
                Le paiement a échoué. Vérifiez vos informations et réessayez.
              </span>
            </div>
            <button
              className={dk.btnOutline}
              onClick={() => setStatus('idle')}
            >
              Réessayer
            </button>
          </div>
        )}

        {/* Payment form */}
        {status === 'idle' && (
          <>
            <div className={dk.card}>
              <span className={dk.sectionLabel}>Mode de paiement</span>
              <PaymentMethodSelector
                value={method}
                onChange={setMethod}
                enableCash={settings?.enableCash ?? true}
                enableMtn={settings?.enableMtnMoney ?? true}
                enableOrange={settings?.enableOrangeMoney ?? true}
              />
            </div>

            {needsPhone && (
              <div className={dk.card}>
                <span className={dk.sectionLabel}>Numéro Mobile Money</span>
                <div className={dk.inputGroup} style={{ marginBottom: 0 }}>
                  <label className={dk.inputLabel} htmlFor="phone">Téléphone</label>
                  <input
                    id="phone"
                    type="tel"
                    className={dk.input}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+237 6XX XXX XXX"
                  />
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Fixed bottom bar */}
      {status === 'idle' && (
        <div className={dk.fixedBar}>
          <div className={dk.fixedBarInfo}>
            <span className={dk.fixedBarLabel}>À régler</span>
            <span className={dk.fixedBarPrice}>{formatPrice(order.totalAmount)}</span>
          </div>
          <button
            className={dk.fixedBarBtn}
            disabled={loading}
            onClick={handlePay}
          >
            {loading ? 'Traitement…' : 'Payer maintenant'}
          </button>
        </div>
      )}
    </div>
  );
}
