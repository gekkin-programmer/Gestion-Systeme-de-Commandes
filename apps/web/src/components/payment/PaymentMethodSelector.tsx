'use client';

import Image from 'next/image';
import dk from '@/styles/dark.module.css';
import { PAYMENT_METHOD, type PaymentMethod } from '@repo/shared';

interface PaymentMethodSelectorProps {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
  enableCash?: boolean;
  enableMtn?: boolean;
  enableOrange?: boolean;
}

const options: {
  method: PaymentMethod;
  labelFr: string;
  subFr: string;
  logo: React.ReactNode;
}[] = [
  {
    method:  PAYMENT_METHOD.CASH,
    labelFr: 'Payer à la réception',
    subFr:   'Règlement en espèces à la livraison',
    logo: (
      <div
        style={{
          width: 36,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid var(--line)',
          flexShrink: 0,
        }}
      >
        <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, color: 'var(--gold)' }}>
          XAF
        </span>
      </div>
    ),
    enabled: true,
  },
  {
    method:  PAYMENT_METHOD.MTN_MOBILE_MONEY,
    labelFr: 'MTN Mobile Money',
    subFr:   'Paiement instantané via MTN MoMo',
    logo: (
      <Image
        src="/MTN.jpg"
        alt="MTN Mobile Money"
        width={36}
        height={36}
        style={{ objectFit: 'contain', flexShrink: 0 }}
      />
    ),
  },
  {
    method:  PAYMENT_METHOD.ORANGE_MONEY,
    labelFr: 'Orange Money',
    subFr:   'Paiement instantané via Orange',
    logo: (
      <Image
        src="/OrangeMoney.png"
        alt="Orange Money"
        width={36}
        height={36}
        style={{ objectFit: 'contain', flexShrink: 0 }}
      />
    ),
  },
];

export function PaymentMethodSelector({
  value,
  onChange,
  enableCash   = true,
  enableMtn    = true,
  enableOrange = true,
}: PaymentMethodSelectorProps) {
  const enabledMap: Record<PaymentMethod, boolean> = {
    [PAYMENT_METHOD.CASH]:             enableCash,
    [PAYMENT_METHOD.MTN_MOBILE_MONEY]: enableMtn,
    [PAYMENT_METHOD.ORANGE_MONEY]:     enableOrange,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {options
        .filter((o) => enabledMap[o.method])
        .map((o) => {
          const isActive = value === o.method;
          return (
            <div
              key={o.method}
              className={`${dk.methodCard} ${isActive ? dk.methodCardActive : ''}`}
              onClick={() => onChange(o.method)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onChange(o.method)}
            >
              {o.logo}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className={`${dk.methodLabel} ${isActive ? dk.methodLabelActive : ''}`}>
                  {o.labelFr}
                </p>
                <p
                  style={{
                    fontFamily: 'Jost, sans-serif',
                    fontSize: 10,
                    color: 'var(--cream-dim)',
                    marginTop: 2,
                    letterSpacing: '0.04em',
                  }}
                >
                  {o.subFr}
                </p>
              </div>
              {isActive && <div className={dk.methodCheck} />}
            </div>
          );
        })}
    </div>
  );
}
