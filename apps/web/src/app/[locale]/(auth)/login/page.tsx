'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import dk from '@/styles/dark.module.css';
import type { Role } from '@repo/shared';

const IconDining = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2" />
    <path d="M7 2v20" />
    <path d="M21 15V2a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
  </svg>
);

export default function LoginPage() {
  const locale = useLocale();
  const router = useRouter();
  const { login } = useAuth();

  const [mounted,  setMounted]  = useState(false);
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [ripple,   setRipple]   = useState(false);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const REDIRECT: Partial<Record<Role, string>> = {
    SUPER_ADMIN: `/${locale}/superadmin`,
    ADMIN:       `/${locale}/admin`,
    STAFF:       `/${locale}/staff/orders`,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      const dest = REDIRECT[user.role as Role] ?? `/${locale}/staff/orders`;
      router.push(dest);
    } catch {
      setError('Identifiants incorrects. Vérifiez votre e-mail et mot de passe.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={dk.page} style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

      {/* Top gold accent */}
      <div style={{ height: 3, background: 'linear-gradient(90deg, transparent, var(--gold), transparent)' }} />

      {/* Centered content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 20px', position: 'relative' }}>
        {/* Animated background blobs */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div style={{
            position: 'absolute', width: 600, height: 600, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(200,169,110,0.18) 0%, transparent 70%)',
            filter: 'blur(40px)',
            top: '-10%', left: '-15%',
            animation: 'blob1 12s ease-in-out infinite',
          }} />
          <div style={{
            position: 'absolute', width: 500, height: 500, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(180,120,60,0.14) 0%, transparent 70%)',
            filter: 'blur(50px)',
            bottom: '-10%', right: '-10%',
            animation: 'blob2 15s ease-in-out infinite',
          }} />
          <div style={{
            position: 'absolute', width: 400, height: 400, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(240,210,150,0.10) 0%, transparent 70%)',
            filter: 'blur(60px)',
            top: '40%', right: '20%',
            animation: 'blob3 10s ease-in-out infinite',
          }} />
        </div>
        <div style={{ width: '100%', maxWidth: 480 }}>

          {/* Brand block */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{
              width: 52,
              height: 52,
              border: '1px solid rgba(200,169,110,0.35)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--gold)',
              marginBottom: 18,
            }}>
              <IconDining />
            </div>
            <span className={dk.sectionLabel} style={{ marginBottom: 10 }}>Espace professionnel</span>
            <h1 className={dk.playfair} style={{ fontSize: 26, color: 'var(--cream)', lineHeight: 1.2, margin: 0 }}>
              Restaurant Commandes
            </h1>
          </div>

          {/* Form card */}
          <div className={dk.card} style={{ marginBottom: 0, padding: '40px 36px', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', position: 'relative', zIndex: 1 }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>

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
                  style={{ fontSize: 14, padding: '14px 14px' }}
                />
              </div>

              <div className={dk.inputGroup} style={{ marginBottom: 6 }}>
                <label className={dk.inputLabel} htmlFor="password">Mot de passe</label>
                <input
                  id="password"
                  type="password"
                  className={dk.input}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  style={{ fontSize: 14, padding: '14px 14px' }}
                />
              </div>

              {/* Forgot password — below field, right-aligned */}
              <div style={{ textAlign: 'right', marginBottom: 22 }}>
                <a
                  href={`/${locale}/forgot-password`}
                  style={{
                    fontFamily: 'Jost, sans-serif',
                    fontSize: 9,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'var(--gold)',
                    textDecoration: 'none',
                    opacity: 0.75,
                  }}
                >
                  Mot de passe oublié ?
                </a>
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
                onMouseDown={() => { setRipple(true); setTimeout(() => setRipple(false), 500); }}
                style={{
                  width: '100%',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'transform 0.1s, background 0.2s',
                }}
              >
                {ripple && (
                  <span style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(255,255,255,0.18)',
                    animation: 'rippleFade 0.5s ease-out forwards',
                  }} />
                )}
                <span style={{ color: '#fff', position: 'relative', zIndex: 1 }}>
                  {loading ? 'Connexion…' : 'Se connecter'}
                </span>
              </button>
            </form>
          </div>

          <p style={{
            textAlign: 'center',
            fontFamily: 'Jost, sans-serif',
            fontSize: 10,
            color: 'var(--cream-dim)',
            marginTop: 20,
            opacity: 0.4,
            letterSpacing: '0.05em',
          }}>
            Accès réservé au personnel du restaurant
          </p>

        </div>
      </div>

      {/* Bottom line */}
      <div style={{ height: 1, background: 'var(--line)' }} />
    </div>
  );
}
