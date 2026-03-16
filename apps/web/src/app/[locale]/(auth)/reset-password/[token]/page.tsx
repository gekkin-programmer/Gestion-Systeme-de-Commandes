'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import api from '@/lib/api';
import dk from '@/styles/dark.module.css';

interface ResetPasswordPageProps {
  params: { token: string; locale: string };
}

export default function ResetPasswordPage({ params }: ResetPasswordPageProps) {
  const locale = useLocale();

  const [mounted,          setMounted]          = useState(false);
  const [newPassword,      setNewPassword]      = useState('');
  const [confirmPassword,  setConfirmPassword]  = useState('');
  const [loading,          setLoading]          = useState(false);
  const [error,            setError]            = useState('');
  const [success,          setSuccess]          = useState(false);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        token:       params.token,
        newPassword,
      });
      setSuccess(true);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Lien invalide ou expiré. Veuillez recommencer.';
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
          <span className={dk.sectionLabel}>Sécurité</span>
          <h1
            className={dk.playfair}
            style={{ fontSize: 28, color: 'var(--cream)', marginBottom: 8, lineHeight: 1.2 }}
          >
            Nouveau mot de passe
          </h1>
          <p
            style={{
              fontFamily: 'Jost, sans-serif',
              fontSize: 12,
              color: 'var(--cream-dim)',
              letterSpacing: '0.05em',
            }}
          >
            Choisissez un nouveau mot de passe sécurisé
          </p>
        </div>

        {success ? (
          <div className={dk.card} style={{ marginBottom: 0 }}>
            <div className={dk.successBox} style={{ marginBottom: 20 }}>
              <span style={{ fontSize: 28 }}>✓</span>
              <p className={dk.playfair} style={{ fontSize: 20, color: 'var(--gold)' }}>
                Mot de passe mis à jour !
              </p>
              <p
                style={{
                  fontFamily: 'Jost, sans-serif',
                  fontSize: 12,
                  color: 'var(--cream-dim)',
                  lineHeight: 1.6,
                }}
              >
                Votre mot de passe a été réinitialisé avec succès.
              </p>
            </div>
            <Link href={`/${locale}/login`} style={{ display: 'block' }}>
              <button className={dk.btn} style={{ width: '100%' }}>
                Se connecter
              </button>
            </Link>
          </div>
        ) : (
          <div className={dk.card} style={{ marginBottom: 0 }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              <div className={dk.inputGroup}>
                <label className={dk.inputLabel} htmlFor="newPassword">Nouveau mot de passe</label>
                <input
                  id="newPassword"
                  type="password"
                  className={dk.input}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                  minLength={8}
                />
              </div>

              <div className={dk.inputGroup}>
                <label className={dk.inputLabel} htmlFor="confirmPassword">Confirmer le mot de passe</label>
                <input
                  id="confirmPassword"
                  type="password"
                  className={dk.input}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                  minLength={8}
                />
              </div>

              {/* Password match indicator */}
              {confirmPassword.length > 0 && (
                <p
                  style={{
                    fontFamily: 'Jost, sans-serif',
                    fontSize: 11,
                    color: newPassword === confirmPassword ? '#4ade80' : '#f87171',
                    marginBottom: 12,
                    marginTop: -4,
                  }}
                >
                  {newPassword === confirmPassword
                    ? '✓ Les mots de passe correspondent'
                    : '✗ Les mots de passe ne correspondent pas'}
                </p>
              )}

              {error && (
                <div className={dk.errorBox} style={{ marginBottom: 16 }}>
                  <span className={dk.errorText}>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className={dk.btn}
                disabled={loading || newPassword !== confirmPassword}
                style={{ width: '100%', marginTop: 4 }}
              >
                {loading ? 'Enregistrement…' : 'Enregistrer le mot de passe'}
              </button>
            </form>
          </div>
        )}

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
