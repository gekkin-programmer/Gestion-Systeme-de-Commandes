'use client';

import { useEffect, useState } from 'react';
import { BackButton } from '@/components/shared/BackButton';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import dk from '@/styles/dark.module.css';

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const restaurantId = user?.restaurantId ?? '';

  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [form, setForm] = useState({
    mtnMoneyNumber:    '',
    orangeMoneyNumber: '',
    enableMtnMoney:    true,
    enableOrangeMoney: true,
    enableCash:        true,
  });

  useEffect(() => {
    if (!restaurantId) return;
    api.get(`/restaurants/${restaurantId}`)
      .then(({ data }) => {
        const s = data.data.settings;
        if (s) setForm({
          mtnMoneyNumber:    s.mtnMoneyNumber ?? '',
          orangeMoneyNumber: s.orangeMoneyNumber ?? '',
          enableMtnMoney:    s.enableMtnMoney,
          enableOrangeMoney: s.enableOrangeMoney,
          enableCash:        s.enableCash,
        });
      })
      .finally(() => setLoading(false));
  }, [restaurantId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await api.patch(`/restaurants/${restaurantId}/settings`, form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const toggle = (key: keyof typeof form) =>
    setForm((p) => ({ ...p, [key]: !p[key] }));

  return (
    <div className={dk.page}>

      {/* Header */}
      <header className={dk.header}>
        <BackButton />
        <span className={dk.headerTitle}>Paramètres</span>
        <div className={dk.headerRight} />
      </header>

      <main className={dk.main}>
        {loading ? (
          <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 12, color: 'var(--cream-dim)', textAlign: 'center', padding: '40px 0' }}>
            Chargement…
          </p>
        ) : (
          <form onSubmit={handleSave}>

            {/* Mobile Money */}
            <div className={dk.card}>
              <span className={dk.sectionLabel}>Modes de paiement</span>

              {/* MTN */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 8 }}>
                  <input
                    type="checkbox"
                    checked={form.enableMtnMoney}
                    onChange={() => toggle('enableMtnMoney')}
                    style={{ accentColor: 'var(--gold)', width: 16, height: 16 }}
                  />
                  <span style={{ fontFamily: 'Jost, sans-serif', fontSize: 13, color: 'var(--cream)' }}>
                    MTN Mobile Money
                  </span>
                </label>
                {form.enableMtnMoney && (
                  <div className={dk.inputGroup} style={{ marginBottom: 0, marginLeft: 26 }}>
                    <label className={dk.inputLabel}>Numéro MTN</label>
                    <input
                      type="tel"
                      className={dk.input}
                      value={form.mtnMoneyNumber}
                      onChange={(e) => setForm((p) => ({ ...p, mtnMoneyNumber: e.target.value }))}
                      placeholder="+237 6XX XXX XXX"
                    />
                  </div>
                )}
              </div>

              <div className={dk.divider} />

              {/* Orange */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 8 }}>
                  <input
                    type="checkbox"
                    checked={form.enableOrangeMoney}
                    onChange={() => toggle('enableOrangeMoney')}
                    style={{ accentColor: 'var(--gold)', width: 16, height: 16 }}
                  />
                  <span style={{ fontFamily: 'Jost, sans-serif', fontSize: 13, color: 'var(--cream)' }}>
                    Orange Money
                  </span>
                </label>
                {form.enableOrangeMoney && (
                  <div className={dk.inputGroup} style={{ marginBottom: 0, marginLeft: 26 }}>
                    <label className={dk.inputLabel}>Numéro Orange</label>
                    <input
                      type="tel"
                      className={dk.input}
                      value={form.orangeMoneyNumber}
                      onChange={(e) => setForm((p) => ({ ...p, orangeMoneyNumber: e.target.value }))}
                      placeholder="+237 6XX XXX XXX"
                    />
                  </div>
                )}
              </div>

              <div className={dk.divider} />

              {/* Cash */}
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={form.enableCash}
                  onChange={() => toggle('enableCash')}
                  style={{ accentColor: 'var(--gold)', width: 16, height: 16 }}
                />
                <span style={{ fontFamily: 'Jost, sans-serif', fontSize: 13, color: 'var(--cream)' }}>
                  Espèces (payer à la réception)
                </span>
              </label>
            </div>

            {/* Success feedback */}
            {saved && (
              <div className={dk.successBox} style={{ padding: '14px 20px', marginBottom: 12 }}>
                <span style={{ fontFamily: 'Jost, sans-serif', fontSize: 12, color: 'var(--gold)', letterSpacing: '0.05em' }}>
                  Paramètres sauvegardés
                </span>
              </div>
            )}

            <button type="submit" className={dk.btn} disabled={saving} style={{ width: '100%' }}>
              {saving ? 'Sauvegarde…' : 'Sauvegarder'}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
