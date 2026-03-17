'use client';

import { useEffect, useRef, useState } from 'react';
import { BackButton } from '@/components/shared/BackButton';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useRestaurantStore } from '@/store/restaurantStore';
import dk from '@/styles/dark.module.css';
import { THEMES } from '@/hooks/useTheme';
import type { ThemePreset } from '@repo/shared';

const THEME_LABELS: Record<ThemePreset, string> = {
  DARK_GOLD:    'Dark Gold',
  WHITE_PURPLE: 'White Purple',
  WHITE_RED:    'White Red',
};

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const restaurantId = user?.restaurantId ?? '';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const setBrand = useRestaurantStore((s) => s.setBrand);

  const [loading, setLoading] = useState(true);

  // Section A — Profile
  const [profileForm, setProfileForm] = useState({ name: '', address: '', city: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savedProfile,  setSavedProfile]  = useState(false);

  // Section B — Logo
  const [logoUrl,        setLogoUrl]        = useState<string | null>(null);
  const [uploadingLogo,  setUploadingLogo]  = useState(false);
  const [logoSuccess,    setLogoSuccess]    = useState(false);

  // Section C — Payment settings + Theme
  const [settingsForm, setSettingsForm] = useState({
    mtnMoneyNumber:    '',
    orangeMoneyNumber: '',
    enableMtnMoney:    true,
    enableOrangeMoney: true,
    enableCash:        true,
    themePreset:       'DARK_GOLD' as ThemePreset,
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [savedSettings,  setSavedSettings]  = useState(false);

  useEffect(() => {
    if (!restaurantId) return;
    api.get(`/restaurants/${restaurantId}`)
      .then(({ data }) => {
        const r = data.data;
        const s = r.settings;
        setProfileForm({
          name:    r.name ?? '',
          address: r.address ?? '',
          city:    r.city ?? '',
        });
        setLogoUrl(r.logoUrl ?? null);
        if (s) {
          setSettingsForm({
            mtnMoneyNumber:    s.mtnMoneyNumber ?? '',
            orangeMoneyNumber: s.orangeMoneyNumber ?? '',
            enableMtnMoney:    s.enableMtnMoney,
            enableOrangeMoney: s.enableOrangeMoney,
            enableCash:        s.enableCash,
            themePreset:       (s.themePreset as ThemePreset) ?? 'DARK_GOLD',
          });
        }
      })
      .finally(() => setLoading(false));
  }, [restaurantId]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setSavedProfile(false);
    try {
      await api.patch(`/restaurants/${restaurantId}`, profileForm);
      setBrand({ name: profileForm.name, logoUrl, themePreset: settingsForm.themePreset });
      setSavedProfile(true);
      setTimeout(() => setSavedProfile(false), 3000);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    setLogoSuccess(false);
    try {
      const fd = new FormData();
      fd.append('logo', file);
      const { data } = await api.post(`/restaurants/${restaurantId}/logo`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const newLogoUrl = data.data.logoUrl;
      setLogoUrl(newLogoUrl);
      setBrand({ name: profileForm.name, logoUrl: newLogoUrl, themePreset: settingsForm.themePreset });
      setLogoSuccess(true);
      setTimeout(() => setLogoSuccess(false), 3000);
    } finally {
      setUploadingLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSavedSettings(false);
    try {
      await api.patch(`/restaurants/${restaurantId}/settings`, settingsForm);
      setBrand({ name: profileForm.name, logoUrl, themePreset: settingsForm.themePreset });
      setSavedSettings(true);
      setTimeout(() => setSavedSettings(false), 3000);
    } finally {
      setSavingSettings(false);
    }
  };

  const toggleSetting = (key: 'enableMtnMoney' | 'enableOrangeMoney' | 'enableCash') =>
    setSettingsForm((p) => ({ ...p, [key]: !p[key] }));

  const inputStyle: React.CSSProperties = {
    fontFamily: 'Jost, sans-serif',
    fontSize: 13,
    color: 'var(--cream)',
  };

  return (
    <div className={dk.page}>

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
          <>

            {/* ─── Section A: Profil ─── */}
            <form onSubmit={handleSaveProfile}>
              <div className={dk.card}>
                <span className={dk.sectionLabel}>Profil du restaurant</span>

                <div className={dk.inputGroup}>
                  <label className={dk.inputLabel}>Nom</label>
                  <input
                    type="text"
                    className={dk.input}
                    value={profileForm.name}
                    onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Nom du restaurant"
                  />
                </div>
                <div className={dk.inputGroup}>
                  <label className={dk.inputLabel}>Adresse</label>
                  <input
                    type="text"
                    className={dk.input}
                    value={profileForm.address}
                    onChange={(e) => setProfileForm((p) => ({ ...p, address: e.target.value }))}
                    placeholder="Adresse"
                  />
                </div>
                <div className={dk.inputGroup} style={{ marginBottom: 0 }}>
                  <label className={dk.inputLabel}>Ville</label>
                  <input
                    type="text"
                    className={dk.input}
                    value={profileForm.city}
                    onChange={(e) => setProfileForm((p) => ({ ...p, city: e.target.value }))}
                    placeholder="Ville"
                  />
                </div>
              </div>

              {savedProfile && (
                <div className={dk.successBox} style={{ padding: '14px 20px', marginBottom: 12 }}>
                  <span style={{ fontFamily: 'Jost, sans-serif', fontSize: 12, color: 'var(--gold)', letterSpacing: '0.05em' }}>
                    Profil sauvegardé
                  </span>
                </div>
              )}
              <button type="submit" className={dk.btn} disabled={savingProfile} style={{ width: '100%', marginBottom: 24 }}>
                {savingProfile ? 'Sauvegarde…' : 'Sauvegarder le profil'}
              </button>
            </form>

            {/* ─── Section B: Logo ─── */}
            <div className={dk.card}>
              <span className={dk.sectionLabel}>Logo</span>

              {logoUrl && (
                <div style={{ marginBottom: 14, textAlign: 'center' }}>
                  <img src={logoUrl} alt="Logo" style={{ maxHeight: 80, maxWidth: '100%', objectFit: 'contain', borderRadius: 4 }} />
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleLogoChange}
              />
              <button
                type="button"
                className={dk.btnOutline}
                style={{ width: '100%' }}
                disabled={uploadingLogo}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploadingLogo ? 'Upload en cours…' : logoUrl ? 'Changer le logo' : 'Uploader un logo'}
              </button>

              {logoSuccess && (
                <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 12, color: 'var(--gold)', textAlign: 'center', marginTop: 8 }}>
                  Logo mis à jour ✓
                </p>
              )}
            </div>

            {/* ─── Section C: Paiement + Thème ─── */}
            <form onSubmit={handleSaveSettings}>

              {/* Payment */}
              <div className={dk.card}>
                <span className={dk.sectionLabel}>Modes de paiement</span>

                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 8 }}>
                    <input
                      type="checkbox"
                      checked={settingsForm.enableMtnMoney}
                      onChange={() => toggleSetting('enableMtnMoney')}
                      style={{ accentColor: 'var(--gold)', width: 16, height: 16 }}
                    />
                    <span style={inputStyle}>MTN Mobile Money</span>
                  </label>
                  {settingsForm.enableMtnMoney && (
                    <div className={dk.inputGroup} style={{ marginBottom: 0, marginLeft: 26 }}>
                      <label className={dk.inputLabel}>Numéro MTN</label>
                      <input
                        type="tel"
                        className={dk.input}
                        value={settingsForm.mtnMoneyNumber}
                        onChange={(e) => setSettingsForm((p) => ({ ...p, mtnMoneyNumber: e.target.value }))}
                        placeholder="+237 6XX XXX XXX"
                      />
                    </div>
                  )}
                </div>

                <div className={dk.divider} />

                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 8 }}>
                    <input
                      type="checkbox"
                      checked={settingsForm.enableOrangeMoney}
                      onChange={() => toggleSetting('enableOrangeMoney')}
                      style={{ accentColor: 'var(--gold)', width: 16, height: 16 }}
                    />
                    <span style={inputStyle}>Orange Money</span>
                  </label>
                  {settingsForm.enableOrangeMoney && (
                    <div className={dk.inputGroup} style={{ marginBottom: 0, marginLeft: 26 }}>
                      <label className={dk.inputLabel}>Numéro Orange</label>
                      <input
                        type="tel"
                        className={dk.input}
                        value={settingsForm.orangeMoneyNumber}
                        onChange={(e) => setSettingsForm((p) => ({ ...p, orangeMoneyNumber: e.target.value }))}
                        placeholder="+237 6XX XXX XXX"
                      />
                    </div>
                  )}
                </div>

                <div className={dk.divider} />

                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={settingsForm.enableCash}
                    onChange={() => toggleSetting('enableCash')}
                    style={{ accentColor: 'var(--gold)', width: 16, height: 16 }}
                  />
                  <span style={inputStyle}>Espèces (payer à la réception)</span>
                </label>
              </div>

              {/* Theme */}
              <div className={dk.card}>
                <span className={dk.sectionLabel}>Thème du menu client</span>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
                  {(Object.keys(THEMES) as ThemePreset[]).map((preset) => {
                    const t = THEMES[preset];
                    const isSelected = settingsForm.themePreset === preset;
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setSettingsForm((p) => ({ ...p, themePreset: preset }))}
                        style={{
                          flex: '1 1 120px',
                          minHeight: 80,
                          background: t.bg,
                          border: isSelected ? `2px solid ${t.gold}` : `2px solid ${t.line}`,
                          borderRadius: 8,
                          padding: '12px 10px',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          outline: 'none',
                          boxShadow: isSelected ? `0 0 0 3px ${t.gold}40` : 'none',
                          transition: 'box-shadow 0.15s',
                        }}
                      >
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: t.gold }} />
                        <span style={{ fontFamily: 'Jost, sans-serif', fontSize: 11, color: t.cream, letterSpacing: '0.05em' }}>
                          {THEME_LABELS[preset]}
                        </span>
                        {isSelected && (
                          <span style={{ fontSize: 10, color: t.gold }}>✓ Actif</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {savedSettings && (
                <div className={dk.successBox} style={{ padding: '14px 20px', marginBottom: 12 }}>
                  <span style={{ fontFamily: 'Jost, sans-serif', fontSize: 12, color: 'var(--gold)', letterSpacing: '0.05em' }}>
                    Paramètres sauvegardés
                  </span>
                </div>
              )}
              <button type="submit" className={dk.btn} disabled={savingSettings} style={{ width: '100%' }}>
                {savingSettings ? 'Sauvegarde…' : 'Sauvegarder'}
              </button>
            </form>
          </>
        )}
      </main>
    </div>
  );
}
