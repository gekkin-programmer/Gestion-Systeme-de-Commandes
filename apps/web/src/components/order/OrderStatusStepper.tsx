'use client';

import { useTranslations } from 'next-intl';
import dk from '@/styles/dark.module.css';
import type { OrderStatus } from '@repo/shared';

const STEPS: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED'];

interface OrderStatusStepperProps {
  status: OrderStatus;
}

export function OrderStatusStepper({ status }: OrderStatusStepperProps) {
  const t = useTranslations('order.status');

  if (status === 'CANCELLED') {
    return (
      <div className={dk.errorBox} style={{ justifyContent: 'center', padding: '24px 20px' }}>
        <span className={dk.errorText} style={{ textAlign: 'center', width: '100%' }}>
          {t('CANCELLED')}
        </span>
      </div>
    );
  }

  const currentIndex = STEPS.indexOf(status);

  return (
    <div className={dk.stepper}>
      {STEPS.map((step, idx) => {
        const isDone    = idx < currentIndex;
        const isCurrent = idx === currentIndex;
        return (
          <div key={step} className={dk.stepItem}>
            <div className={dk.stepRow}>
              {idx > 0 && (
                <div className={`${dk.stepLine} ${isDone || isCurrent ? dk.stepLineDone : ''}`} />
              )}
              <div
                className={`${dk.stepDot} ${isDone ? dk.stepDotDone : isCurrent ? dk.stepDotCurrent : ''}`}
              >
                {isDone ? '✓' : idx + 1}
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`${dk.stepLine} ${isDone ? dk.stepLineDone : ''}`} />
              )}
            </div>
            <span className={`${dk.stepLabel} ${isCurrent ? dk.stepLabelCurrent : ''}`}>
              {t(step as any)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
