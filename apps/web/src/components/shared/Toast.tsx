'use client';

import { useEffect, useState } from 'react';
import dk from '@/styles/dark.module.css';

interface ToastProps {
  message: string;
  color?: string;   // dot color
  duration?: number;
  onClose: () => void;
}

export function Toast({ message, color = 'var(--gold)', duration = 4000, onClose }: ToastProps) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const hide = setTimeout(() => setExiting(true), duration);
    return () => clearTimeout(hide);
  }, [duration]);

  // Remove from DOM after exit animation
  useEffect(() => {
    if (!exiting) return;
    const rm = setTimeout(onClose, 300);
    return () => clearTimeout(rm);
  }, [exiting, onClose]);

  return (
    <div className={`${dk.toast} ${exiting ? dk.toastExiting : ''}`}>
      <span className={dk.toastDot} style={{ background: color }} />
      {message}
    </div>
  );
}
