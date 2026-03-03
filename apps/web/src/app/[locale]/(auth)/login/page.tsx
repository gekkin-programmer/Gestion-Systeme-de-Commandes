'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import dk from '@/styles/dark.module.css';
import type { Role } from '@repo/shared';

export default function LoginPage() {
  const locale = useLocale();
  const router = useRouter();
  const { login } = useAuth();

  const [mounted,  setMounted]  = useState(false);
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

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
    <div
      className={dk.page}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
    >
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Title block */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <span className={dk.sectionLabel}>Espace professionnel</span>
          <h1
            className={dk.playfair}
            style={{ fontSize: 30, color: 'var(--cream)', marginBottom: 8, lineHeight: 1.2 }}
          >
            Restaurant Commandes
          </h1>
          <p
            style={{
              fontFamily: 'Jost, sans-serif',
              fontSize: 12,
              color: 'var(--cream-dim)',
              letterSpacing: '0.05em',
            }}
          >
            Connectez-vous pour accéder au tableau de bord
          </p>
        </div>

        {/* Form card */}
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

            <div className={dk.inputGroup}>
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
              {loading ? 'Connexion en cours…' : 'Se connecter'}
            </button>
          </form>
        </div>

        {/* Footer hint */}
        <p
          style={{
            textAlign: 'center',
            fontFamily: 'Jost, sans-serif',
            fontSize: 11,
            color: 'var(--cream-dim)',
            marginTop: 24,
            opacity: 0.5,
          }}
        >
          Accès réservé au personnel du restaurant
        </p>
      </div>
    </div>
  );
}
