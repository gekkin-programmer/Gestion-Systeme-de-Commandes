'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import api from '@/lib/api';
import dk from '@/styles/dark.module.css';

export default function ForgotPasswordPage() {
  const locale = useLocale();

  const [mounted,   setMounted]   = useState(false);
  const [email,     setEmail]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [resetUrl,  setResetUrl]  = useState('');

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResetUrl('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setResetUrl(data.data?.resetUrl ?? '');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Une erreur est survenue. Vérifiez l\'adresse e-mail saisie.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={dk.page}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
    >
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Title block */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <span className={dk.sectionLabel}>Réinitialisation</span>
          <h1
            className={dk.playfair}
            style={{ fontSize: 28, color: 'var(--cream)', marginBottom: 8, lineHeight: 1.2 }}
          >
            Mot de passe oublié
          </h1>
          <p
            style={{
              fontFamily: 'Jost, sans-serif',
              fontSize: 12,
              color: 'var(--cream-dim)',
              letterSpacing: '0.05em',
            }}
          >
            Saisissez votre adresse e-mail pour recevoir un lien de réinitialisation
          </p>
        </div>

        {/* Success state */}
        {resetUrl ? (
          <div className={dk.card} style={{ marginBottom: 0 }}>
            <div className={dk.successBox} style={{ marginBottom: 20 }}>
              <span style={{ fontSize: 28 }}>✓</span>
              <p
                className={dk.playfair}
                style={{ fontSize: 18, color: 'var(--gold)' }}
              >
                Lien généré
              </p>
              <p
                style={{
                  fontFamily: 'Jost, sans-serif',
                  fontSize: 12,
                  color: 'var(--cream-dim)',
                  lineHeight: 1.6,
                }}
              >
                Lien de réinitialisation généré. En production, il serait envoyé par email.
              </p>
            </div>
            <div
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--line)',
                padding: '12px 14px',
                marginBottom: 16,
                wordBreak: 'break-all',
              }}
            >
              <span className={dk.sectionLabel} style={{ marginBottom: 6 }}>Lien de test</span>
              <a
                href={resetUrl}
                style={{
                  fontFamily: 'Jost, sans-serif',
                  fontSize: 11,
                  color: 'var(--gold)',
                  textDecoration: 'underline',
                  lineHeight: 1.6,
                  display: 'block',
                }}
              >
                {resetUrl}
              </a>
            </div>
            <button
              className={dk.btnOutline}
              style={{ width: '100%' }}
              onClick={() => { setResetUrl(''); setEmail(''); }}
            >
              Nouveau lien
            </button>
          </div>
        ) : (
          /* Form card */
          <div className={dk.card} style={{ marginBottom: 0 }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              <div className={dk.inputGroup}>
                <label className={dk.inputLabel} htmlFor="email">Adresse e-mail</label>
                <input
                  id="email"
                  type="email"
                  className={dk.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@restaurant.cm"
                  required
                  autoComplete="email"
                />
              </div>

              {error && (
                <div className={dk.errorBox} style={{ marginBottom: 16 }}>
                  <span className={dk.errorText}>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className={dk.btn}
                disabled={loading}
                style={{ width: '100%', marginTop: 4 }}
              >
                {loading ? 'Envoi en cours…' : 'Envoyer le lien'}
              </button>
            </form>
          </div>
        )}

        {/* Back to login */}
        <p
          style={{
            textAlign: 'center',
            fontFamily: 'Jost, sans-serif',
            fontSize: 11,
            color: 'var(--cream-dim)',
            marginTop: 24,
          }}
        >
          <Link
            href={`/${locale}/login`}
            style={{ color: 'var(--gold)', textDecoration: 'none', letterSpacing: '0.05em' }}
          >
            ← Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  );
}
