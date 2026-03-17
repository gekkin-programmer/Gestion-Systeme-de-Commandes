'use client';

import { useEffect, type ReactNode } from 'react';
import dk from '@/styles/dark.module.css';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className={dk.page} style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', padding: '20px' }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      />

      {/* Panel */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: 520,
        background: 'var(--surface)',
        border: '1px solid var(--line)',
        borderBottom: '1px solid var(--line)',
        padding: '28px 24px 32px',
        animation: 'slideUp 0.25s ease-out',
      }}>
        {/* Top gold accent */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, var(--gold), transparent)' }} />

        {title && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <span style={{ fontFamily: 'Jost, sans-serif', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--cream-dim)', display: 'block', marginBottom: 4 }}>
                Formulaire
              </span>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, color: 'var(--cream)', fontWeight: 400, margin: 0 }}>
                {title}
              </h2>
            </div>
            <button
              onClick={onClose}
              style={{ background: 'none', border: '1px solid var(--line)', color: 'var(--cream-dim)', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, transition: 'border-color 0.2s, color 0.2s' }}
              aria-label="Fermer"
            >
              ✕
            </button>
          </div>
        )}
        {children}
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(40px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}
